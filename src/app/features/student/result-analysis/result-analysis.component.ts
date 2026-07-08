import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AttemptService } from '../../../core/services/attempt.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { PageHeaderComponent, DonutChartComponent, StatusBadgeComponent } from '../../../shared/components';

@Component({
  selector: 'oes-result-analysis',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, PageHeaderComponent, DonutChartComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result-analysis.component.html',
  styleUrl: './result-analysis.component.css'
})
export class ResultAnalysisComponent {
  private readonly attemptService = inject(AttemptService);
  private readonly pdfExportService = inject(PdfExportService);
  private readonly route = inject(ActivatedRoute);

  readonly attemptId = this.route.snapshot.paramMap.get('attemptId') as string;
  readonly report = computed(() => this.attemptService.buildReport(this.attemptId));

  readonly breakdownSegments = computed(() => {
    const report = this.report();
    if (!report) return [];
    return [
      { label: 'Correct', value: report.attempt.correctCount, color: 'var(--oes-success-500)' },
      { label: 'Incorrect', value: report.attempt.incorrectCount, color: 'var(--oes-danger-500)' },
      { label: 'Unanswered', value: report.attempt.unansweredCount, color: 'var(--oes-text-tertiary)' }
    ];
  });

  exportPdf(): void {
    const report = this.report();
    if (report) this.pdfExportService.exportAttemptReport(report);
  }
}
