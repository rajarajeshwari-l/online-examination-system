import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService, LoadingService } from '../../../core/services';
import { ExamService } from '../../../core/services/exam.service';
import { AttemptService } from '../../../core/services/attempt.service';
import {
  PageHeaderComponent,
  StatCardComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  SkeletonComponent
} from '../../../shared/components';

@Component({
  selector: 'oes-student-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    SkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly examService = inject(ExamService);
  private readonly attemptService = inject(AttemptService);
  private readonly loadingService = inject(LoadingService);

  readonly isLoading = signal(true);
  readonly studentId = computed(() => this.authService.session()?.userId ?? '');
  readonly firstName = computed(() => this.authService.currentUserName().split(' ')[0]);

  readonly myAttempts = computed(() =>
    this.attemptService.getByStudent(this.studentId()).filter((a) => a.status !== 'in-progress')
  );

  readonly averageScore = computed(() => {
    const attempts = this.myAttempts();
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
  });

  readonly passedCount = computed(() => this.myAttempts().filter((a) => a.passed).length);

  readonly availableExamsCount = computed(() => this.examService.publishedExams().length);

  readonly recommendedExams = computed(() => {
    const attemptedExamIds = new Set(this.attemptService.getByStudent(this.studentId()).map((a) => a.examId));
    return this.examService
      .publishedExams()
      .filter((exam) => !attemptedExamIds.has(exam.id))
      .slice(0, 3);
  });

  readonly recentResults = computed(() =>
    this.myAttempts()
      .slice()
      .sort((a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime())
      .slice(0, 4)
      .map((attempt) => ({
        attempt,
        examTitle: this.examService.getById(attempt.examId)?.title ?? 'Untitled Exam'
      }))
  );

  constructor() {
    this.loadingService.simulateDelay(600).then(() => this.isLoading.set(false));
  }
}
