import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';
import {
  Lecture,
  Question,
  ConfusionMapData,
  HeatmapBucket,
  RecapResponse,
  ApiResponse,
} from '../models/types';
import { bedrockService } from '../services/bedrock-service';
import { transcribeService } from '../services/transcribe-service';
import { AppError } from '../middleware/error-handler';

export const professorRoutes = Router();

/**
 * GET /api/professor/confusion-map/:lectureId
 * Get confusion map heatmap for a lecture
 */
professorRoutes.get(
  '/confusion-map/:lectureId',
  authenticate,
  requireRole('professor'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lectureId } = req.params;
      const bucketSize = parseInt(req.query.bucket_size as string) || 30; // 30-second buckets by default

      // Get lecture
      const lecture = await queryOne<Lecture>(
        'SELECT * FROM lectures WHERE id = $1 AND professor_id = $2',
        [lectureId, req.user!.user_id]
      );

      if (!lecture) {
        throw new AppError(404, 'LECTURE_NOT_FOUND', 'Lecture not found');
      }

      if (!lecture.duration_seconds) {
        throw new AppError(400, 'NO_DURATION', 'Lecture duration not available');
      }

      // Get all questions for this lecture (only from students who allow analytics)
      const questions = await query<Question>(
        `SELECT * FROM questions 
         WHERE lecture_id = $1 AND allow_analytics = true
         ORDER BY timestamp_seconds ASC`,
        [lectureId]
      );

      // Group questions into time buckets
      const buckets: Map<number, Question[]> = new Map();
      const numBuckets = Math.ceil(lecture.duration_seconds / bucketSize);

      // Initialize buckets
      for (let i = 0; i < numBuckets; i++) {
        buckets.set(i, []);
      }

      // Distribute questions into buckets
      for (const question of questions) {
        const bucketIndex = Math.floor(question.timestamp_seconds / bucketSize);
        const bucket = buckets.get(bucketIndex) || [];
        bucket.push(question);
        buckets.set(bucketIndex, bucket);
      }

      // Find max questions in any bucket for normalization
      let maxQuestions = 0;
      buckets.forEach((questions) => {
        if (questions.length > maxQuestions) {
          maxQuestions = questions.length;
        }
      });

      // Build heatmap data
      const heatmap: HeatmapBucket[] = [];
      buckets.forEach((questions, bucketIndex) => {
        const startTime = bucketIndex * bucketSize;
        const endTime = Math.min(startTime + bucketSize, lecture.duration_seconds!);
        const intensity = maxQuestions > 0 ? questions.length / maxQuestions : 0;

        heatmap.push({
          start_time: startTime,
          end_time: endTime,
          question_count: questions.length,
          intensity,
          sample_questions: questions.slice(0, 3).map((q) => ({
            question_text: q.question_text,
            timestamp_seconds: q.timestamp_seconds,
          })),
        });
      });

      const confusionMapData: ConfusionMapData = {
        lecture_id: lecture.id,
        lecture_title: lecture.title,
        duration_seconds: lecture.duration_seconds,
        heatmap,
        total_questions: questions.length,
      };

      const response: ApiResponse<ConfusionMapData> = {
        success: true,
        data: confusionMapData,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/professor/questions/:lectureId
 * Get all questions for a lecture
 */
professorRoutes.get(
  '/questions/:lectureId',
  authenticate,
  requireRole('professor'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lectureId } = req.params;

      // Verify professor owns this lecture
      const lecture = await queryOne<Lecture>(
        'SELECT id FROM lectures WHERE id = $1 AND professor_id = $2',
        [lectureId, req.user!.user_id]
      );

      if (!lecture) {
        throw new AppError(404, 'LECTURE_NOT_FOUND', 'Lecture not found');
      }

      const questions = await query<Question>(
        `SELECT q.*, u.name as student_name
         FROM questions q
         JOIN users u ON q.student_id = u.id
         WHERE q.lecture_id = $1 AND q.allow_analytics = true
         ORDER BY q.timestamp_seconds ASC`,
        [lectureId]
      );

      const response: ApiResponse<Question[]> = {
        success: true,
        data: questions,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/professor/recap/:lectureId
 * Generate a recap script based on confusion patterns
 */
professorRoutes.post(
  '/recap/:lectureId',
  authenticate,
  requireRole('professor'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lectureId } = req.params;

      // Get lecture with transcript
      const lecture = await queryOne<Lecture>(
        'SELECT * FROM lectures WHERE id = $1 AND professor_id = $2',
        [lectureId, req.user!.user_id]
      );

      if (!lecture) {
        throw new AppError(404, 'LECTURE_NOT_FOUND', 'Lecture not found');
      }

      if (!lecture.transcript) {
        throw new AppError(400, 'NO_TRANSCRIPT', 'Lecture transcript not available');
      }

      // Get questions grouped by timestamp ranges
      const questions = await query<Question>(
        `SELECT * FROM questions 
         WHERE lecture_id = $1 AND allow_analytics = true
         ORDER BY timestamp_seconds ASC`,
        [lectureId]
      );

      if (questions.length === 0) {
        throw new AppError(400, 'NO_QUESTIONS', 'No student questions available for this lecture');
      }

      // Group questions into confusion points (60-second windows)
      const confusionPoints = groupQuestionsIntoConfusionPoints(questions, 60);

      // Get top 3 confusion points
      const topConfusionPoints = confusionPoints
        .sort((a, b) => b.question_count - a.question_count)
        .slice(0, 3);

      // Extract full transcript text
      const fullText = transcribeService.extractFullText(lecture.transcript);

      // Generate recap using Bedrock
      const recap = await bedrockService.generateRecap(
        lecture.title,
        fullText,
        topConfusionPoints
      );

      const response: ApiResponse<RecapResponse> = {
        success: true,
        data: recap,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Helper function to group questions into confusion points
 */
function groupQuestionsIntoConfusionPoints(
  questions: Question[],
  windowSize: number
): Array<{ timestamp: number; question_count: number; sample_questions: string[] }> {
  const points: Map<number, Question[]> = new Map();

  // Group questions by time window
  for (const question of questions) {
    const windowStart = Math.floor(question.timestamp_seconds / windowSize) * windowSize;
    const existing = points.get(windowStart) || [];
    existing.push(question);
    points.set(windowStart, existing);
  }

  // Convert to array and format
  const result: Array<{
    timestamp: number;
    question_count: number;
    sample_questions: string[];
  }> = [];

  points.forEach((questions, timestamp) => {
    result.push({
      timestamp,
      question_count: questions.length,
      sample_questions: questions.slice(0, 5).map((q) => q.question_text),
    });
  });

  return result;
}

export { professorRoutes };
