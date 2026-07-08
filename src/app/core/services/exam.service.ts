import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { IdGeneratorService } from './id-generator.service';
import { QuestionService } from './question.service';
import { Exam, ExamFormValue, ExamSummary, ExamAttempt } from '../models';

const EXAMS_KEY = 'exams';
const ATTEMPTS_KEY = 'attempts';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly _exams = signal<Exam[]>(this.storage.get<Exam[]>(EXAMS_KEY, []));
  readonly exams = this._exams.asReadonly();

  readonly publishedExams = computed(() => this._exams().filter((e) => e.status === 'published'));
  readonly totalExams = computed(() => this._exams().length);

  constructor(
    private readonly storage: StorageService,
    private readonly idGenerator: IdGeneratorService,
    private readonly questionService: QuestionService
  ) {}

  getById(id: string): Exam | undefined {
    return this._exams().find((e) => e.id === id);
  }

  create(value: ExamFormValue, createdBy: string): Exam {
    const now = new Date().toISOString();
    const exam: Exam = {
      id: this.idGenerator.generate('exam'),
      ...value,
      totalMarks: 0,
      questionIds: [],
      createdBy,
      createdAt: now,
      updatedAt: now
    };
    this.persist([...this._exams(), exam]);
    return exam;
  }

  update(id: string, value: Partial<ExamFormValue>): void {
    const updated = this._exams().map((e) =>
      e.id === id ? { ...e, ...value, updatedAt: new Date().toISOString() } : e
    );
    this.persist(updated);
  }

  attachQuestion(examId: string, questionId: string, marks: number): void {
    const updated = this._exams().map((e) => {
      if (e.id !== examId) return e;
      const questionIds = [...e.questionIds, questionId];
      return {
        ...e,
        questionIds,
        totalMarks: e.totalMarks + marks,
        questionsToShow: e.questionsToShow || questionIds.length,
        updatedAt: new Date().toISOString()
      };
    });
    this.persist(updated);
  }

  detachQuestion(examId: string, questionId: string, marks: number): void {
    const updated = this._exams().map((e) => {
      if (e.id !== examId) return e;
      const questionIds = e.questionIds.filter((id) => id !== questionId);
      return {
        ...e,
        questionIds,
        totalMarks: Math.max(0, e.totalMarks - marks),
        questionsToShow: Math.min(e.questionsToShow, questionIds.length) || questionIds.length,
        updatedAt: new Date().toISOString()
      };
    });
    this.persist(updated);
  }

  delete(id: string): void {
    this.persist(this._exams().filter((e) => e.id !== id));
    this.questionService.deleteByExam(id);
    const attempts = this.storage.get<ExamAttempt[]>(ATTEMPTS_KEY, []).filter((a) => a.examId !== id);
    this.storage.set(ATTEMPTS_KEY, attempts);
  }

  duplicate(id: string): Exam | undefined {
    const source = this.getById(id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const clone: Exam = {
      ...source,
      id: this.idGenerator.generate('exam'),
      title: `${source.title} (Copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };
    this.persist([...this._exams(), clone]);
    return clone;
  }

  getSummaries(): ExamSummary[] {
    const attempts = this.storage.get<ExamAttempt[]>(ATTEMPTS_KEY, []);
    return this._exams().map((exam) => {
      const examAttempts = attempts.filter((a) => a.examId === exam.id && a.status !== 'in-progress');
      const averageScore =
        examAttempts.length > 0
          ? Math.round(examAttempts.reduce((sum, a) => sum + a.percentage, 0) / examAttempts.length)
          : 0;
      return {
        ...exam,
        questionCount: exam.questionIds.length,
        attemptCount: examAttempts.length,
        averageScore
      };
    });
  }

  private persist(exams: Exam[]): void {
    this._exams.set(exams);
    this.storage.set(EXAMS_KEY, exams);
  }
}
