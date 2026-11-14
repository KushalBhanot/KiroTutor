import {
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  TranscriptionJob,
} from '@aws-sdk/client-transcribe';
import { transcribeClient } from './aws-clients';
import { TranscribeJobResult, TranscriptData } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

export class TranscribeService {
  /**
   * Start a transcription job for a lecture
   */
  async startTranscriptionJob(
    s3Uri: string,
    lectureId: string,
    mediaFormat: string = 'mp4'
  ): Promise<TranscribeJobResult> {
    const jobName = `lecture-${lectureId}-${Date.now()}`;

    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US',
      MediaFormat: mediaFormat,
      Media: {
        MediaFileUri: s3Uri,
      },
      OutputBucketName: process.env.S3_BUCKET_NAME,
      OutputKey: `transcripts/${lectureId}/`,
      Settings: {
        ShowSpeakerLabels: false,
        MaxSpeakerLabels: 2,
      },
    });

    try {
      const response = await transcribeClient.send(command);
      
      return {
        jobName,
        status: 'processing',
      };
    } catch (error) {
      console.error('Error starting transcription job:', error);
      throw new Error(`Failed to start transcription: ${error}`);
    }
  }

  /**
   * Get the status of a transcription job
   */
  async getTranscriptionJobStatus(jobName: string): Promise<TranscribeJobResult> {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });

    try {
      const response = await transcribeClient.send(command);
      const job = response.TranscriptionJob;

      if (!job) {
        throw new Error('Transcription job not found');
      }

      const status = this.mapJobStatus(job.TranscriptionJobStatus);

      return {
        jobName,
        status,
        transcriptFileUri: job.Transcript?.TranscriptFileUri,
      };
    } catch (error) {
      console.error('Error getting transcription job status:', error);
      throw error;
    }
  }

  /**
   * Download and parse the transcript from S3
   */
  async downloadTranscript(transcriptFileUri: string): Promise<TranscriptData> {
    try {
      const response = await fetch(transcriptFileUri);
      
      if (!response.ok) {
        throw new Error(`Failed to download transcript: ${response.statusText}`);
      }

      const transcript = await response.json() as TranscriptData;
      return transcript;
    } catch (error) {
      console.error('Error downloading transcript:', error);
      throw error;
    }
  }

  /**
   * Poll for transcription job completion
   * Returns the transcript when complete
   */
  async waitForTranscriptionCompletion(
    jobName: string,
    maxAttempts: number = 60,
    intervalMs: number = 10000
  ): Promise<TranscriptData> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getTranscriptionJobStatus(jobName);

      if (result.status === 'completed' && result.transcriptFileUri) {
        return await this.downloadTranscript(result.transcriptFileUri);
      }

      if (result.status === 'failed') {
        throw new Error('Transcription job failed');
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Transcription job timeout');
  }

  /**
   * Extract the full text from transcript
   */
  extractFullText(transcript: TranscriptData): string {
    if (!transcript.results?.transcripts?.[0]?.transcript) {
      return '';
    }
    return transcript.results.transcripts[0].transcript;
  }

  /**
   * Extract timestamped segments from transcript
   */
  extractTimestampedSegments(transcript: TranscriptData): Array<{
    text: string;
    start_time: number;
    end_time: number;
  }> {
    const items = transcript.results?.items || [];
    const segments: Array<{ text: string; start_time: number; end_time: number }> = [];
    let currentSegment: { words: string[]; start_time: number; end_time: number } | null = null;

    for (const item of items) {
      if (item.type === 'pronunciation' && item.start_time && item.end_time) {
        const startTime = parseFloat(item.start_time);
        const endTime = parseFloat(item.end_time);
        const word = item.alternatives[0]?.content || '';

        if (!currentSegment) {
          currentSegment = {
            words: [word],
            start_time: startTime,
            end_time: endTime,
          };
        } else {
          currentSegment.words.push(word);
          currentSegment.end_time = endTime;

          // Create new segment every 30 seconds
          if (endTime - currentSegment.start_time > 30) {
            segments.push({
              text: currentSegment.words.join(' '),
              start_time: currentSegment.start_time,
              end_time: currentSegment.end_time,
            });
            currentSegment = null;
          }
        }
      }
    }

    // Add final segment
    if (currentSegment) {
      segments.push({
        text: currentSegment.words.join(' '),
        start_time: currentSegment.start_time,
        end_time: currentSegment.end_time,
      });
    }

    return segments;
  }

  /**
   * Get media format from file extension
   */
  getMediaFormat(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const formatMap: Record<string, string> = {
      mp4: 'mp4',
      mp3: 'mp3',
      wav: 'wav',
      m4a: 'mp4',
      flac: 'flac',
      ogg: 'ogg',
      webm: 'webm',
    };
    return formatMap[extension || ''] || 'mp4';
  }

  /**
   * Map AWS Transcribe job status to our internal status
   */
  private mapJobStatus(
    awsStatus?: string
  ): 'pending' | 'processing' | 'completed' | 'failed' {
    switch (awsStatus) {
      case 'QUEUED':
      case 'IN_PROGRESS':
        return 'processing';
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

export const transcribeService = new TranscribeService();
