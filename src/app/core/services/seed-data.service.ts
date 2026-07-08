import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { PasswordHasherService } from './password-hasher.service';
import { IdGeneratorService } from './id-generator.service';
import { AdminUser, AppUser, Exam, Question, StudentUser } from '../models';

const USERS_KEY = 'users';
const EXAMS_KEY = 'exams';
const QUESTIONS_KEY = 'questions';
const ATTEMPTS_KEY = 'attempts';
const SEED_FLAG_KEY = 'seeded_v1';

const AVATAR_PALETTE = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Ensures the app never opens to an empty, lifeless state. On first run
 * this seeds one admin account, a handful of students, a bank of
 * questions across multiple subjects, and a few published exams so the
 * dashboards, charts, and tables all have meaningful data immediately.
 */
@Injectable({ providedIn: 'root' })
export class SeedDataService {
  constructor(
    private readonly storage: StorageService,
    private readonly hasher: PasswordHasherService,
    private readonly idGenerator: IdGeneratorService
  ) {}

  seedIfNeeded(): void {
    if (this.storage.get<boolean>(SEED_FLAG_KEY, false)) return;

    const admin = this.buildAdmin();
    const students = this.buildStudents();
    const users: AppUser[] = [admin, ...students];

    const jsQuestions = this.buildQuestions('JavaScript Fundamentals', 'exam_js');
    const ngQuestions = this.buildQuestions('Angular Essentials', 'exam_ng');
    const dsaQuestions = this.buildQuestions('Data Structures & Algorithms', 'exam_dsa');

    const exams: Exam[] = [
      this.buildExam('exam_js', 'JavaScript Fundamentals', 'Core JS concepts: closures, async, prototypes, and ES2020+ features.', 'JavaScript', jsQuestions, admin.id, 'code', '#f59e0b'),
      this.buildExam('exam_ng', 'Angular Essentials', 'Components, signals, RxJS, routing, and dependency injection.', 'Angular', ngQuestions, admin.id, 'view_in_ar', '#dc2626'),
      this.buildExam('exam_dsa', 'Data Structures & Algorithms', 'Arrays, trees, graphs, complexity analysis, and problem solving.', 'Computer Science', dsaQuestions, admin.id, 'account_tree', '#6366f1')
    ];

    this.storage.set(USERS_KEY, users);
    this.storage.set(QUESTIONS_KEY, [...jsQuestions, ...ngQuestions, ...dsaQuestions]);
    this.storage.set(EXAMS_KEY, exams);
    this.storage.set(ATTEMPTS_KEY, []);
    this.storage.set(SEED_FLAG_KEY, true);
  }

  private buildAdmin(): AdminUser {
    return {
      id: 'user_admin_1',
      fullName: 'Ava Whitfield',
      email: 'admin@exampro.io',
      passwordHash: this.hasher.hash('Admin@123'),
      role: 'admin',
      department: 'Academic Operations',
      avatarColor: AVATAR_PALETTE[0],
      createdAt: new Date().toISOString()
    };
  }

  private buildStudents(): StudentUser[] {
    const roster = [
      { name: 'Liam Carter', roll: 'STU-2041', batch: '2026-CSE-A' },
      { name: 'Noah Bennett', roll: 'STU-2042', batch: '2026-CSE-A' },
      { name: 'Emma Reyes', roll: 'STU-2043', batch: '2026-CSE-B' },
      { name: 'Olivia Chen', roll: 'STU-2044', batch: '2026-CSE-B' }
    ];

    return roster.map((entry, index) => ({
      id: `user_student_${index + 1}`,
      fullName: entry.name,
      email: `${entry.name.toLowerCase().replace(' ', '.')}@student.exampro.io`,
      passwordHash: this.hasher.hash('Student@123'),
      role: 'student' as const,
      rollNumber: entry.roll,
      batch: entry.batch,
      phone: `+1 555-01${10 + index}`,
      status: 'active' as const,
      avatarColor: AVATAR_PALETTE[(index + 1) % AVATAR_PALETTE.length],
      createdAt: new Date().toISOString()
    }));
  }

  private buildExam(
    id: string,
    title: string,
    description: string,
    subject: string,
    questions: Question[],
    createdBy: string,
    icon: string,
    color: string
  ): Exam {
    const now = new Date().toISOString();
    return {
      id,
      title,
      description,
      subject,
      durationMinutes: 30,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
      passingMarks: Math.ceil(questions.length * 0.5),
      questionIds: questions.map((q) => q.id),
      randomizeQuestions: true,
      randomizeOptions: true,
      questionsToShow: questions.length,
      status: 'published',
      startWindow: null,
      endWindow: null,
      createdBy,
      createdAt: now,
      updatedAt: now,
      thumbnailIcon: icon,
      thumbnailColor: color
    };
  }

  private buildQuestions(topic: string, examId: string): Question[] {
    const bank: { text: string; options: string[]; correct: number; difficulty: 'easy' | 'medium' | 'hard' }[] =
      topic === 'JavaScript Fundamentals'
        ? [
            { text: 'What does the "===" operator check in JavaScript?', options: ['Value only', 'Value and type', 'Type only', 'Reference only'], correct: 1, difficulty: 'easy' },
            { text: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correct: 1, difficulty: 'easy' },
            { text: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function bundled with its lexical scope', 'A type of array', 'A CSS property'], correct: 1, difficulty: 'medium' },
            { text: 'Which method converts a JSON string into an object?', options: ['JSON.stringify()', 'JSON.parse()', 'Object.assign()', 'JSON.convert()'], correct: 1, difficulty: 'easy' },
            { text: 'What does "this" refer to inside an arrow function?', options: ['The global object', 'The enclosing lexical scope', 'A new object', 'undefined always'], correct: 1, difficulty: 'hard' },
            { text: 'Which array method creates a new array with transformed elements?', options: ['forEach()', 'map()', 'filter()', 'reduce()'], correct: 1, difficulty: 'easy' },
            { text: 'What is the output of typeof null?', options: ['"null"', '"undefined"', '"object"', '"number"'], correct: 2, difficulty: 'medium' },
            { text: 'Which is used to handle asynchronous operations cleanly?', options: ['Callbacks only', 'Promises/async-await', 'setTimeout only', 'for loops'], correct: 1, difficulty: 'medium' }
          ]
        : topic === 'Angular Essentials'
        ? [
            { text: 'What decorator marks a class as an Angular component?', options: ['@Injectable', '@NgModule', '@Component', '@Directive'], correct: 2, difficulty: 'easy' },
            { text: 'What are Angular Signals primarily used for?', options: ['Styling components', 'Fine-grained reactive state management', 'Routing', 'HTTP requests'], correct: 1, difficulty: 'medium' },
            { text: 'Which function creates a writable signal?', options: ['computed()', 'effect()', 'signal()', 'input()'], correct: 2, difficulty: 'easy' },
            { text: 'What is the purpose of a route guard?', options: ['Style routes', 'Control access to routes', 'Cache HTTP calls', 'Lazy load modules'], correct: 1, difficulty: 'medium' },
            { text: 'Which class enables navigation between components?', options: ['HttpClient', 'Router', 'FormBuilder', 'ChangeDetectorRef'], correct: 1, difficulty: 'easy' },
            { text: 'What does OnPush change detection strategy optimize?', options: ['Bundle size', 'Re-render frequency by relying on reference changes', 'CSS specificity', 'Server response time'], correct: 1, difficulty: 'hard' },
            { text: 'Standalone components eliminate the need for what?', options: ['Templates', 'NgModules', 'Services', 'Decorators'], correct: 1, difficulty: 'medium' },
            { text: 'Which lifecycle hook runs once after the first change detection?', options: ['ngOnChanges', 'ngOnInit', 'ngAfterViewInit', 'ngOnDestroy'], correct: 1, difficulty: 'easy' }
          ]
        : [
            { text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correct: 1, difficulty: 'medium' },
            { text: 'Which data structure uses LIFO ordering?', options: ['Queue', 'Stack', 'Linked List', 'Graph'], correct: 1, difficulty: 'easy' },
            { text: 'What is the worst-case time complexity of quicksort?', options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], correct: 2, difficulty: 'hard' },
            { text: 'A binary search tree provides average-case search of what complexity?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correct: 1, difficulty: 'medium' },
            { text: 'Which traversal visits nodes level by level?', options: ['Pre-order', 'In-order', 'Post-order', 'Breadth-first'], correct: 3, difficulty: 'medium' },
            { text: 'What does a hash map provide on average for lookups?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correct: 2, difficulty: 'easy' },
            { text: 'Which structure is ideal for implementing a priority queue?', options: ['Array', 'Heap', 'Stack', 'Singly linked list'], correct: 1, difficulty: 'hard' },
            { text: 'What characterizes a Directed Acyclic Graph (DAG)?', options: ['Contains cycles', 'Undirected edges only', 'Directed edges with no cycles', 'No edges'], correct: 2, difficulty: 'hard' }
          ];

    const now = new Date().toISOString();
    return bank.map((entry, index) => {
      const options = entry.options.map((text, optIndex) => ({
        id: this.idGenerator.generate(`opt${index}${optIndex}`),
        text
      }));
      return {
        id: this.idGenerator.generate(`q_${examId}_${index}`),
        examId,
        text: entry.text,
        type: 'single' as const,
        options,
        correctOptionIds: [options[entry.correct].id],
        marks: 5,
        negativeMarks: 1,
        difficulty: entry.difficulty,
        topic,
        createdAt: now,
        updatedAt: now
      };
    });
  }
}
