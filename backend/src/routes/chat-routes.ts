import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';
import { Lecture, Question, ChatRequest, ChatResponse, ApiResponse } from '../models/types';
import { bedrockService } from '../services/bedrock-service';
import { transcribeService } from '../services/transcribe-service';
import { AppError } from '../middleware/error-handler';

export const chatRoutes = Router();

/**
 * POST /api/chat/:lectureId
 * Ask a question about a lecture
 */
chatRoutes.post(
  '/:lectureId',
  authenticate,
  requireRole('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lectureId } = req.params;
      const { question, timestamp_seconds, allow_analytics = true }: ChatRequest = req.body;

      if (!question) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Question is required');
      }

      // Get lecture with transcript
      const lecture = await queryOne<Lecture>(
        'SELECT * FROM lectures WHERE id = $1',
        [lectureId]
      );

      if (!lecture) {
        throw new AppError(404, 'LECTURE_NOT_FOUND', 'Lecture not found');
      }

      if (!lecture.transcript) {
        throw new AppError(400, 'NO_TRANSCRIPT', 'Lecture transcription not yet available');
      }

      // Extract full text from transcript
      const fullText = transcribeService.extractFullText(lecture.transcript);

      // Get answer from Bedrock
      const result = await bedrockService.answerQuestion(
        question,
        fullText,
        timestamp_seconds
      );

      // Store question and answer
      const [storedQuestion] = await query<Question>(
        `INSERT INTO questions (lecture_id, student_id, question_text, answer_text, timestamp_seconds, allow_analytics)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          lectureId,
          req.user!.user_id,
          question,
          result.answer,
          timestamp_seconds || 0,
          allow_analytics,
        ]
      );

      const response: ApiResponse<ChatResponse> = {
        success: true,
        data: {
          answer: result.answer,
          related_timestamps: result.related_timestamps,
          question_id: storedQuestion.id,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/chat/:lectureId/history
 * Get chat history for a lecture (for the current student)
 */
chatRoutes.get(
  '/:lectureId/history',
  authenticate,
  requireRole('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lectureId } = req.params;

      const questions = await query<Question>(
        `SELECT * FROM questions 
         WHERE lecture_id = $1 AND student_id = $2
         ORDER BY created_at ASC`,
        [lectureId, req.user!.user_id]
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

