import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, requireAnyRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';
import { Lecture, StudyKit, ApiResponse } from '../models/types';
import { s3Service } from '../services/s3-service';
import { transcribeService } from '../services/transcribe-service';
import { bedrockService } from '../services/bedrock-service';
import { AppError } from '../middleware/error-handler';

export const lectureRoutes = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '500') * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'video/mp4,audio/mpeg,audio/wav').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

/**
 * POST /api/lectures
 * Upload a new lecture
 */
lectureRoutes.post(
  '/',
  authenticate,
  requireAnyRole(['student', 'professor']),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'NO_FILE', 'No file uploaded');
      }

      const { title, course_id } = req.body;

      if (!title || !course_id) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Title and course_id required');
      }

      // Create lecture record
      const [lecture] = await query<Lecture>(
        `INSERT INTO lectures (title, course_id, professor_id, s3_key, s3_url, file_size_bytes, mime_type, transcription_status)
         VALUES ($1, $2, $3, '', '', $4, $5, 'pending')
         RETURNING *`,
        [title, course_id, req.user!.user_id, req.file.size, req.file.mimetype]
      );

      // Upload to S3
      const s3Result = await s3Service.uploadLecture(req.file, lecture.id);

      // Update lecture with S3 info
      const [updatedLecture] = await query<Lecture>(
        `UPDATE lectures 
         SET s3_key = $1, s3_url = $2
         WHERE id = $3
         RETURNING *`,
        [s3Result.key, s3Result.url, lecture.id]
      );

      // Start transcription job
      const mediaFormat = transcribeService.getMediaFormat(req.file.originalname);
      const transcribeResult = await transcribeService.startTranscriptionJob(
        s3Result.url,
        lecture.id,
        mediaFormat
      );

      // Update with transcription job info
      await query(
        `UPDATE lectures 
         SET transcription_job_name = $1, transcription_status = 'processing'
         WHERE id = $2`,
        [transcribeResult.jobName, lecture.id]
      );

      const response: ApiResponse<{ lecture: Lecture; transcription_job: string }> = {
        success: true,
        data: {
          lecture: updatedLecture,
          transcription_job: transcribeResult.jobName,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/lectures/:id
 * Get lecture details
 */
lectureRoutes.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lecture = await queryOne<Lecture>(
        'SELECT * FROM lectures WHERE id = $1',
        [req.params.id]
      );

      if (!lecture) {
        throw new AppError(404, 'LECTURE_NOT_FOUND', 'Lecture not found');
      }

      const response: ApiResponse<Lecture> = {
        success: true,
        data: lecture,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/lectures/:id/status
 * Check transcription status and generate study kit when ready
 */
lectureRoutes.get(
  '/:id/status',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lecture = await queryOne<Lecture>(
        'SELECT * FROM lectures WHERE id = $1',
        [req.params.id]
      );

      if (!lecture) {
        throw new AppError(404, 'LECTURE_NOT_FOUND', 'Lecture not found');
      }

      // If processing, check status
      if (lecture.transcription_status === 'processing' && lecture.transcription_job_name) {
        const jobStatus = await transcribeService.getTranscriptionJobStatus(
          lecture.transcription_job_name
        );

        if (jobStatus.status === 'completed' && jobStatus.transcriptFileUri) {
          // Download transcript
          const transcript = await transcribeService.downloadTranscript(
            jobStatus.transcriptFileUri
          );

          // Upload transcript to S3
          const transcriptS3 = await s3Service.uploadTranscript(transcript, lecture.id);

          // Update lecture
          await query(
            `UPDATE lectures 
             SET transcript = $1, transcript_s3_url = $2, transcript_s3_key = $3, 
                 transcription_status = 'completed', duration_seconds = $4
             WHERE id = $5`,
            [
              JSON.stringify(transcript),
              transcriptS3.url,
              transcriptS3.key,
              Math.floor(parseFloat(transcript.results.items[transcript.results.items.length - 1]?.end_time || '0')),
              lecture.id,
            ]
          );

          // Generate study kit in background (don't wait)
          generateStudyKitAsync(lecture.id, lecture.title, transcript);

          const response: ApiResponse<{ status: string; message: string }> = {
            success: true,
            data: {
              status: 'completed',
              message: 'Transcription complete, generating study kit...',
            },
          };

          return res.json(response);
        } else if (jobStatus.status === 'failed') {
          await query(
            'UPDATE lectures SET transcription_status = $1 WHERE id = $2',
            ['failed', lecture.id]
          );
        }
      }

      const response: ApiResponse<{ status: string }> = {
        success: true,
        data: { status: lecture.transcription_status },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/lectures/:id/studykit
 * Get study kit for a lecture
 */
lectureRoutes.get(
  '/:id/studykit',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studyKit = await queryOne<StudyKit>(
        'SELECT * FROM study_kits WHERE lecture_id = $1',
        [req.params.id]
      );

      if (!studyKit) {
        throw new AppError(404, 'STUDY_KIT_NOT_FOUND', 'Study kit not generated yet');
      }

      const response: ApiResponse<StudyKit> = {
        success: true,
        data: studyKit,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to generate study kit asynchronously
async function generateStudyKitAsync(
  lectureId: string,
  lectureTitle: string,
  transcript: any
): Promise<void> {
  try {
    const fullText = transcribeService.extractFullText(transcript);
    const studyKitData = await bedrockService.generateStudyKit(fullText, lectureTitle);

    await query(
      `INSERT INTO study_kits (lecture_id, summary, takeaways, questions, glossary)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        lectureId,
        studyKitData.summary,
        JSON.stringify(studyKitData.takeaways),
        JSON.stringify(studyKitData.questions),
        JSON.stringify(studyKitData.glossary),
      ]
    );

    console.log(`Study kit generated for lecture ${lectureId}`);
  } catch (error) {
    console.error(`Error generating study kit for lecture ${lectureId}:`, error);
  }
}

