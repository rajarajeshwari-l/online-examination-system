import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';

import { ExamService } from '../../../core/services/exam.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { AuthService } from '../../../core/services';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { PageHeaderComponent, EmptyStateComponent, SearchInputComponent, StatusBadgeComponent } from '../../../shared/components';

interface ResultRow {
  attemptId: string;
  studentName: string;
  rollNumber: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

@Component({
  selector: 'oes-exam-results',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    PageHeaderComponent,
    EmptyStateComponent,
    SearchInputComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-results.component.html',
  styleUrl: './exam-results.component.css'
})
export class ExamResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);
  private readonly attemptService = inject(AttemptService);
  private readonly authService = inject(AuthService);
  private readonly pdfExportService = inject(PdfExportService);

  readonly examId = this.route.snapshot.paramMap.get('examId') as string;
  readonly exam = computed(() => this.examService.getById(this.examId));

  readonly searchTerm = signal('');
  readonly sortState = signal<Sort>({ active: 'submittedAt', direction: 'desc' });
  readonly displayedColumns = ['studentName', 'rollNumber', 'score', 'percentage', 'status', 'submittedAt'];

  private readonly baseRows = computed<ResultRow[]>(() => {
    const attempts = this.attemptService.getByExam(this.examId).filter((a) => a.status !== 'in-progress');
    return attempts.map((attempt) => {
      const student = this.authService.getUserById(attempt.studentId);
      return {
        attemptId: attempt.id,
        studentName: student?.fullName ?? 'Unknown',
        rollNumber: student && 'rollNumber' in student ? student.rollNumber : '—',
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt ?? attempt.startedAt
      };
    });
  });

  readonly rows = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    let filtered = this.baseRows();
    if (term) {
      filtered = filtered.filter(
        (r) => r.studentName.toLowerCase().includes(term) || r.rollNumber.toLowerCase().includes(term)
      );
    }

    const sort = this.sortState();
    if (!sort.active || sort.direction === '') return filtered;

    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const key = sort.active as keyof ResultRow;
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  });

  readonly averagePercentage = computed(() => {
    const rows = this.baseRows();
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((sum, r) => sum + r.percentage, 0) / rows.length);
  });

  readonly passCount = computed(() => this.baseRows().filter((r) => r.passed).length);

  onSortChange(sort: Sort): void {
    this.sortState.set(sort);
  }

  exportAllResults(): void {
    const exam = this.exam();
    if (!exam) return;
    this.pdfExportService.exportResultsTable(
      exam.title,
      this.rows().map((r) => ({
        student: r.studentName,
        score: r.score,
        total: r.totalMarks,
        percentage: r.percentage,
        status: r.passed ? 'Passed' : 'Failed'
      }))
    );
  }

  exportSingleResult(attemptId: string): void {
    const report = this.attemptService.buildReport(attemptId);
    if (report) this.pdfExportService.exportAttemptReport(report);
  }
}
