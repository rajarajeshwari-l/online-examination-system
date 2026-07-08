export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'single' | 'multiple' | 'true-false';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correctOptionIds: string[];
  marks: number;
  negativeMarks: number;
  difficulty: QuestionDifficulty;
  topic: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFormValue {
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correctOptionIds: string[];
  marks: number;
  negativeMarks: number;
  difficulty: QuestionDifficulty;
  topic: string;
  explanation?: string;
}
