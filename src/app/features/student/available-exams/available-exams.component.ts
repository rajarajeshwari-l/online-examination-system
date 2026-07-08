import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageEvent } from '@angular/material/paginator';

import { ExamService } from '../../../core/services/exam.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { AuthService, LoadingService } from '../../../core/services';
import { PageHeaderComponent, SearchInputComponent, EmptyStateComponent, SkeletonComponent, PaginatorComponent } from '../../../shared/components';

@Component({
  selector: 'oes-available-exams',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
    SearchInputComponent,
    EmptyStateComponent,
    SkeletonComponent,
    PaginatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './available-exams.component.html',
  styleUrl: './available-exams.component.css'
})
export class AvailableExamsComponent {
  private readonly examService = inject(ExamService);
  private readonly attemptService = inject(AttemptService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);

  readonly isLoading = signal(true);
  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(6);

  readonly studentId = computed(() => this.authService.session()?.userId ?? '');

  private readonly examsWithAttemptInfo = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const studentAttempts = this.attemptService.getByStudent(this.studentId());

    return this.examService
      .publishedExams()
      .filter((exam) => !term || exam.title.toLowerCase().includes(term) || exam.subject.toLowerCase().includes(term))
      .map((exam) => {
        const attempts = studentAttempts.filter((a) => a.examId === exam.id && a.status !== 'in-progress');
        const inProgress = studentAttempts.find((a) => a.examId === exam.id && a.status === 'in-progress');
        const bestAttempt = attempts.sort((a, b) => b.percentage - a.percentage)[0];
        return { exam, attemptCount: attempts.length, bestAttempt, inProgress };
      });
  });

  readonly totalCount = computed(() => this.examsWithAttemptInfo().length);

  readonly pagedExams = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.examsWithAttemptInfo().slice(start, start + this.pageSize());
  });

  constructor() {
    this.loadingService.simulateDelay(550).then(() => this.isLoading.set(false));
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
