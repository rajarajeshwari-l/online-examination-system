export type AttemptStatus = 'in-progress' | 'submitted' | 'auto-submitted';

export interface AttemptAnswer {
  questionId: string;
  selectedOptionIds: string[];
  markedForReview: boolean;
  isVisited: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  questionOrder: string[];
  answers: AttemptAnswer[];
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  durationMinutes: number;
  remainingSeconds: number;
  score: number;
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
  passed: boolean;
}

export interface AttemptQuestionResult {
  questionId: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  selectedOptionIds: string[];
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: string;
}

export interface AttemptReport {
  attempt: ExamAttempt;
  examTitle: string;
  studentName: string;
  questionResults: AttemptQuestionResult[];
}
