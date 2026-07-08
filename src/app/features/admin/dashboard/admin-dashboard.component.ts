import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService, LoadingService } from '../../../core/services';
import {
  StatCardComponent,
  PageHeaderComponent,
  BarChartComponent,
  DonutChartComponent,
  AvatarComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  SkeletonComponent
} from '../../../shared/components';

@Component({
  selector: 'oes-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    StatCardComponent,
    PageHeaderComponent,
    BarChartComponent,
    DonutChartComponent,
    AvatarComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    SkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);

  readonly isLoading = signal(true);

  readonly stats = computed(() => this.analyticsService.getOverviewStats());
  readonly scoreDistribution = computed(() =>
    this.analyticsService.getScoreDistribution().map((bucket) => ({ label: bucket.label, value: bucket.count }))
  );
  readonly examPerformance = computed(() => this.analyticsService.getExamPerformance());
  readonly recentActivity = computed(() => this.analyticsService.getRecentActivity(6));

  readonly passFailSegments = computed(() => {
    const stats = this.stats();
    const passed = Math.round((stats.passRatePercentage / 100) * stats.totalAttempts);
    const failed = stats.totalAttempts - passed;
    return [
      { label: 'Passed', value: passed, color: 'var(--oes-success-500)' },
      { label: 'Failed', value: failed, color: 'var(--oes-danger-500)' }
    ];
  });

  readonly firstName = computed(() => this.authService.currentUserName().split(' ')[0]);

  constructor() {
    this.loadingService.simulateDelay(650).then(() => this.isLoading.set(false));
  }
}
