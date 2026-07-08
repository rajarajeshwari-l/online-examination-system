import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { PageEvent } from '@angular/material/paginator';

import { ExamService } from '../../../core/services/exam.service';
import { ToastService, LoadingService } from '../../../core/services';
import { ConfirmDialogService } from '../../../shared/components';
import { ExamStatus, ExamSummary } from '../../../core/models';
import {
  PageHeaderComponent,
  SearchInputComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  SkeletonComponent,
  PaginatorComponent,
  toneForExamStatus
} from '../../../shared/components';

type StatusFilter = 'all' | ExamStatus;

@Component({
  selector: 'oes-exam-list',
  standalone: true,
  imports: [
    RouterLink,
    TitleCasePipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    SkeletonComponent,
    PaginatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css'
})
export class ExamListComponent {
  private readonly examService = inject(ExamService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(6);

  readonly statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' }
  ];

  private readonly filteredExams = computed<ExamSummary[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    return this.examService.getSummaries().filter((exam) => {
      const matchesTerm =
        !term || exam.title.toLowerCase().includes(term) || exam.subject.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || exam.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly totalCount = computed(() => this.filteredExams().length);

  readonly pagedExams = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredExams().slice(start, start + this.pageSize());
  });

  constructor() {
    this.loadingService.simulateDelay(550).then(() => this.isLoading.set(false));
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  setStatusFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  badgeTone(status: string) {
    return toneForExamStatus(status);
  }

  editExam(examId: string): void {
    this.router.navigate(['/admin/exams', examId, 'edit']);
  }

  manageQuestions(examId: string): void {
    this.router.navigate(['/admin/exams', examId, 'questions']);
  }

  viewResults(examId: string): void {
    this.router.navigate(['/admin/exams', examId, 'results']);
  }

  duplicateExam(examId: string): void {
    const clone = this.examService.duplicate(examId);
    if (clone) {
      this.toastService.success('Exam duplicated', `"${clone.title}" was created as a draft.`);
    }
  }

  async deleteExam(exam: ExamSummary): Promise<void> {
    const confirmed = await this.confirmDialog.confirmDelete('Exam');
    if (!confirmed) return;

    this.examService.delete(exam.id);
    this.toastService.success('Exam deleted', `"${exam.title}" and its questions have been removed.`);
  }
}
