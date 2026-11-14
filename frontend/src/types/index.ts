export interface Lecture {
  id: string;
  title: string;
  course_id: string;
  professor_id: string;
  s3_url: string;
  transcript_s3_url: string | null;
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed';
  duration_seconds: number | null;
  created_at: string;
}

export interface StudyKit {
  id: string;
  lecture_id: string;
  summary: string;
  takeaways: string[];
  questions: StudyQuestion[];
  glossary: Record<string, string>;
  generated_at: string;
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
  created_at: string;
}

export interface HeatmapBucket {
  start_time: number;
  end_time: number;
  question_count: number;
  intensity: number;
  sample_questions: Array<{
    question_text: string;
    timestamp_seconds: number;
  }>;
}

export interface ConfusionMapData {
  lecture_id: string;
  lecture_title: string;
  duration_seconds: number;
  heatmap: HeatmapBucket[];
  total_questions: number;
}
