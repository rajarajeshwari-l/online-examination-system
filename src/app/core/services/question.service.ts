import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { IdGeneratorService } from './id-generator.service';
import { Question, QuestionFormValue } from '../models';

const QUESTIONS_KEY = 'questions';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly _questions = signal<Question[]>(this.storage.get<Question[]>(QUESTIONS_KEY, []));
  readonly questions = this._questions.asReadonly();
  readonly totalCount = computed(() => this._questions().length);

  constructor(
    private readonly storage: StorageService,
    private readonly idGenerator: IdGeneratorService
  ) {}

  getByExam(examId: string): Question[] {
    return this._questions().filter((q) => q.examId === examId);
  }

  getById(id: string): Question | undefined {
    return this._questions().find((q) => q.id === id);
  }

  create(examId: string, value: QuestionFormValue): Question {
    const now = new Date().toISOString();
    const question: Question = {
      id: this.idGenerator.generate('question'),
      examId,
      createdAt: now,
      updatedAt: now,
      ...value
    };
    this.persist([...this._questions(), question]);
    return question;
  }

  update(id: string, value: QuestionFormValue): void {
    const updated = this._questions().map((q) =>
      q.id === id ? { ...q, ...value, updatedAt: new Date().toISOString() } : q
    );
    this.persist(updated);
  }

  delete(id: string): void {
    this.persist(this._questions().filter((q) => q.id !== id));
  }

  deleteByExam(examId: string): void {
    this.persist(this._questions().filter((q) => q.examId !== examId));
  }

  private persist(questions: Question[]): void {
    this._questions.set(questions);
    this.storage.set(QUESTIONS_KEY, questions);
  }
}
