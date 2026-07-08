import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageEvent } from '@angular/material/paginator';

import { AttemptService } from '../../../core/services/attempt.service';
import { ExamService } from '../../../core/services/exam.service';
import { AuthService } from '../../../core/services';
import {
  PageHeaderComponent,
  SearchInputComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  PaginatorComponent
} from '../../../shared/components';

@Component({
  selector: 'oes-previous-attempts',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    PaginatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './previous-attempts.component.html',
  styleUrl: './previous-attempts.component.css'
})
export class PreviousAttemptsComponent {
  private readonly attemptService = inject(AttemptService);
  private readonly examService = inject(ExamService);
  private readonly authService = inject(AuthService);

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(8);

  private readonly studentId = computed(() => this.authService.session()?.userId ?? '');

  private readonly allAttempts = computed(() =>
    this.attemptService
      .getByStudent(this.studentId())
      .filter((a) => a.status !== 'in-progress')
      .map((attempt) => ({
        attempt,
        examTitle: this.examService.getById(attempt.examId)?.title ?? 'Untitled Exam',
        subject: this.examService.getById(attempt.examId)?.subject ?? ''
      }))
  );

  private readonly filteredAttempts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allAttempts();
    return this.allAttempts().filter(
      (item) => item.examTitle.toLowerCase().includes(term) || item.subject.toLowerCase().includes(term)
    );
  });

  readonly totalCount = computed(() => this.filteredAttempts().length);

  readonly pagedAttempts = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredAttempts().slice(start, start + this.pageSize());
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
