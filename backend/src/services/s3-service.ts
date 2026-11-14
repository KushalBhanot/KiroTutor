import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from './aws-clients';
import { S3UploadResult } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class S3Service {
  /**
   * Upload a lecture file to S3
   */
  async uploadLecture(
    file: Express.Multer.File,
    lectureId: string
  ): Promise<S3UploadResult> {
    const fileExtension = this.getFileExtension(file.originalname);
    const key = `lectures/${lectureId}/original${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    const url = `s3://${S3_BUCKET_NAME}/${key}`;

    return {
      url,
      key,
      bucket: S3_BUCKET_NAME,
    };
  }

  /**
   * Upload transcript JSON to S3
   */
  async uploadTranscript(
    transcript: any,
    lectureId: string
  ): Promise<S3UploadResult> {
    const key = `transcripts/${lectureId}/transcript.json`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(transcript, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(command);

    const url = `s3://${S3_BUCKET_NAME}/${key}`;

    return {
      url,
      key,
      bucket: S3_BUCKET_NAME,
    };
  }

  /**
   * Generate a presigned URL for downloading a file
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Get the S3 URI for a key
   */
  getS3Uri(key: string): string {
    return `s3://${S3_BUCKET_NAME}/${key}`;
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(filename: string): string {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : '';
  }

  /**
   * Get public HTTPS URL for S3 object (if bucket is configured for public access)
   */
  getPublicUrl(key: string): string {
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }
}

export const s3Service = new S3Service();
