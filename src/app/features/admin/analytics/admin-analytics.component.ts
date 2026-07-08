import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ExamService } from '../../../core/services/exam.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { AuthService } from '../../../core/services';
import {
  PageHeaderComponent,
  StatCardComponent,
  BarChartComponent,
  DonutChartComponent,
  EmptyStateComponent,
  AvatarComponent
} from '../../../shared/components';

interface TopPerformer {
  studentName: string;
  avatarColor: string;
  averagePercentage: number;
  attemptCount: number;
}

@Component({
  selector: 'oes-admin-analytics',
  standalone: true,
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    BarChartComponent,
    DonutChartComponent,
    EmptyStateComponent,
    AvatarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css'
})
export class AdminAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly examService = inject(ExamService);
  private readonly attemptService = inject(AttemptService);
  private readonly authService = inject(AuthService);

  readonly stats = computed(() => this.analyticsService.getOverviewStats());
  readonly scoreDistribution = computed(() =>
    this.analyticsService.getScoreDistribution().map((bucket) => ({ label: bucket.label, value: bucket.count }))
  );
  readonly examPerformance = computed(() => this.analyticsService.getExamPerformance());

  readonly difficultySegments = computed(() => {
    const attempts = this.attemptService.attempts().filter((a) => a.status !== 'in-progress');
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const attempt of attempts) {
      if (attempt.percentage >= 75) easy++;
      else if (attempt.percentage >= 45) medium++;
      else hard++;
    }
    return [
      { label: 'Strong (75%+)', value: easy, color: 'var(--oes-success-500)' },
      { label: 'Moderate (45-74%)', value: medium, color: 'var(--oes-warning-500)' },
      { label: 'Needs Improvement (<45%)', value: hard, color: 'var(--oes-danger-500)' }
    ];
  });

  readonly topPerformers = computed<TopPerformer[]>(() => {
    const students = this.authService.getAllUsers().filter((u) => u.role === 'student');
    const rows = students.map((student) => {
      const attempts = this.attemptService.getByStudent(student.id).filter((a) => a.status !== 'in-progress');
      const averagePercentage =
        attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
      return {
        studentName: student.fullName,
        avatarColor: student.avatarColor,
        averagePercentage,
        attemptCount: attempts.length
      };
    });
    return rows
      .filter((r) => r.attemptCount > 0)
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .slice(0, 5);
  });
}
