export type ExamStatus = 'draft' | 'published' | 'archived';

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questionIds: string[];
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questionsToShow: number;
  status: ExamStatus;
  startWindow: string | null;
  endWindow: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  thumbnailIcon: string;
  thumbnailColor: string;
}

export interface ExamFormValue {
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  passingMarks: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questionsToShow: number;
  status: ExamStatus;
  startWindow: string | null;
  endWindow: string | null;
  thumbnailIcon: string;
  thumbnailColor: string;
}

export interface ExamSummary extends Exam {
  questionCount: number;
  attemptCount: number;
  averageScore: number;
}
