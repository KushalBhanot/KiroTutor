// Type definitions for KiroTutor

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor';
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  professor_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Lecture {
  id: string;
  title: string;
  course_id: string;
  professor_id: string;
  s3_url: string;
  s3_key: string;
  transcript_s3_url: string | null;
  transcript_s3_key: string | null;
  transcript: TranscriptData | null;
  transcription_job_name: string | null;
  transcription_status: TranscriptionStatus;
  duration_seconds: number | null;
  file_size_bytes: number;
  mime_type: string;
  created_at: Date;
  updated_at: Date;
}

export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TranscriptData {
  jobName: string;
  results: {
    transcripts: Array<{
      transcript: string;
    }>;
    items: TranscriptItem[];
  };
}

export interface TranscriptItem {
  start_time?: string;
  end_time?: string;
  alternatives: Array<{
    content: string;
    confidence?: string;
  }>;
  type: 'pronunciation' | 'punctuation';
}

export interface StudyKit {
  id: string;
  lecture_id: string;
  summary: string;
  takeaways: string[];
  questions: StudyQuestion[];
  glossary: Record<string, string>;
  generated_at: Date;
}

export interface StudyQuestion {
  question: string;
  answer?: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];
}

export interface Question {
  id: string;
  lecture_id: string;
  student_id: string;
  question_text: string;
  answer_text: string;
  timestamp_seconds: number;
  allow_analytics: boolean;
  created_at: Date;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: Date;
}

// API Request/Response types

export interface LectureUploadRequest {
  title: string;
  course_id: string;
}

export interface LectureUploadResponse {
  lecture_id: string;
  s3_url: string;
  transcription_job_name: string;
}

export interface ChatRequest {
  question: string;
  timestamp_seconds?: number;
  allow_analytics?: boolean;
}

export interface ChatResponse {
  answer: string;
  related_timestamps: number[];
  question_id: string;
}

export interface ConfusionMapData {
  lecture_id: string;
  lecture_title: string;
  duration_seconds: number;
  heatmap: HeatmapBucket[];
  total_questions: number;
}

export interface HeatmapBucket {
  start_time: number;
  end_time: number;
  question_count: number;
  intensity: number; // 0-1 normalized
  sample_questions: Array<{
    question_text: string;
    timestamp_seconds: number;
  }>;
}

export interface RecapRequest {
  lecture_id: string;
  focus_timestamps?: number[];
}

export interface RecapResponse {
  recap_script: string;
  key_confusion_points: Array<{
    timestamp: number;
    topic: string;
    question_count: number;
  }>;
  estimated_duration_minutes: number;
}

// AWS Service types

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export interface TranscribeJobResult {
  jobName: string;
  status: TranscriptionStatus;
  transcriptFileUri?: string;
}

export interface BedrockRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
}

export interface BedrockResponse {
  content: string;
  model_id: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Utility types

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// JWT Payload
export interface JwtPayload {
  user_id: string;
  email: string;
  role: 'student' | 'professor';
  iat: number;
  exp: number;
}
