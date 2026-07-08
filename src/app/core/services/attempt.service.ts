import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { IdGeneratorService } from './id-generator.service';
import { QuestionService } from './question.service';
import { ExamService } from './exam.service';
import { AuthService } from './auth.service';
import {
  AttemptAnswer,
  AttemptQuestionResult,
  AttemptReport,
  ExamAttempt
} from '../models';

const ATTEMPTS_KEY = 'attempts';

@Injectable({ providedIn: 'root' })
export class AttemptService {
  private readonly _attempts = signal<ExamAttempt[]>(this.storage.get<ExamAttempt[]>(ATTEMPTS_KEY, []));
  readonly attempts = this._attempts.asReadonly();

  constructor(
    private readonly storage: StorageService,
    private readonly idGenerator: IdGeneratorService,
    private readonly questionService: QuestionService,
    private readonly examService: ExamService,
    private readonly authService: AuthService
  ) {}

  getByStudent(studentId: string): ExamAttempt[] {
    return this._attempts()
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getByExam(examId: string): ExamAttempt[] {
    return this._attempts().filter((a) => a.examId === examId);
  }

  getInProgress(studentId: string, examId: string): ExamAttempt | undefined {
    return this._attempts().find(
      (a) => a.studentId === studentId && a.examId === examId && a.status === 'in-progress'
    );
  }

  getById(id: string): ExamAttempt | undefined {
    return this._attempts().find((a) => a.id === id);
  }

  startAttempt(examId: string, studentId: string): ExamAttempt {
    const existing = this.getInProgress(studentId, examId);
    if (existing) return existing;

    const exam = this.examService.getById(examId);
    if (!exam) throw new Error('Exam not found');

    const allQuestions = this.questionService.getByExam(examId);
    const questionCount = exam.questionsToShow || allQuestions.length;
    const pool = exam.randomizeQuestions ? this.shuffle(allQuestions) : allQuestions;
    const selected = pool.slice(0, questionCount);

    const answers: AttemptAnswer[] = selected.map((q) => ({
      questionId: q.id,
      selectedOptionIds: [],
      markedForReview: false,
      isVisited: false
    }));

    const attempt: ExamAttempt = {
      id: this.idGenerator.generate('attempt'),
      examId,
      studentId,
      questionOrder: selected.map((q) => q.id),
      answers,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      submittedAt: null,
      durationMinutes: exam.durationMinutes,
      remainingSeconds: exam.durationMinutes * 60,
      score: 0,
      totalMarks: selected.reduce((sum, q) => sum + q.marks, 0),
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: selected.length,
      percentage: 0,
      passed: false
    };

    this.persist([...this._attempts(), attempt]);
    return attempt;
  }

  saveProgress(attemptId: string, answers: AttemptAnswer[], remainingSeconds: number): void {
    const updated = this._attempts().map((a) =>
      a.id === attemptId ? { ...a, answers, remainingSeconds } : a
    );
    this.persist(updated);
  }

  submitAttempt(attemptId: string, autoSubmitted: boolean): ExamAttempt {
    const attempt = this.getById(attemptId);
    if (!attempt) throw new Error('Attempt not found');

    const exam = this.examService.getById(attempt.examId);
    const scored = this.scoreAttempt(attempt);
    const finalized: ExamAttempt = {
      ...attempt,
      ...scored,
      status: autoSubmitted ? 'auto-submitted' : 'submitted',
      submittedAt: new Date().toISOString(),
      passed: exam ? scored.score >= exam.passingMarks : false
    };

    this.persist(this._attempts().map((a) => (a.id === attemptId ? finalized : a)));
    return finalized;
  }

  buildReport(attemptId: string): AttemptReport | undefined {
    const attempt = this.getById(attemptId);
    if (!attempt) return undefined;

    const exam = this.examService.getById(attempt.examId);
    const student = this.authService.getUserById(attempt.studentId);

    const questionResults: AttemptQuestionResult[] = attempt.questionOrder.map((questionId) => {
      const question = this.questionService.getById(questionId);
      const answer = attempt.answers.find((a) => a.questionId === questionId);
      const selectedOptionIds = answer?.selectedOptionIds ?? [];
      const correctOptionIds = question?.correctOptionIds ?? [];
      const isCorrect = this.arraysMatch(selectedOptionIds, correctOptionIds);

      return {
        questionId,
        questionText: question?.text ?? 'Question unavailable',
        options: question?.options.map((o) => ({ id: o.id, text: o.text })) ?? [],
        correctOptionIds,
        selectedOptionIds,
        isCorrect,
        marksAwarded: isCorrect ? question?.marks ?? 0 : selectedOptionIds.length > 0 ? -(question?.negativeMarks ?? 0) : 0,
        explanation: question?.explanation
      };
    });

    return {
      attempt,
      examTitle: exam?.title ?? 'Untitled Exam',
      studentName: student?.fullName ?? 'Unknown Student',
      questionResults
    };
  }

  private scoreAttempt(attempt: ExamAttempt) {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    for (const questionId of attempt.questionOrder) {
      const question = this.questionService.getById(questionId);
      if (!question) continue;
      const answer = attempt.answers.find((a) => a.questionId === questionId);
      const selected = answer?.selectedOptionIds ?? [];

      if (selected.length === 0) {
        unansweredCount++;
        continue;
      }

      if (this.arraysMatch(selected, question.correctOptionIds)) {
        score += question.marks;
        correctCount++;
      } else {
        score -= question.negativeMarks;
        incorrectCount++;
      }
    }

    score = Math.max(0, score);
    const percentage = attempt.totalMarks > 0 ? Math.round((score / attempt.totalMarks) * 100) : 0;

    return { score, correctCount, incorrectCount, unansweredCount, percentage };
  }

  private arraysMatch(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private persist(attempts: ExamAttempt[]): void {
    this._attempts.set(attempts);
    this.storage.set(ATTEMPTS_KEY, attempts);
  }
}
