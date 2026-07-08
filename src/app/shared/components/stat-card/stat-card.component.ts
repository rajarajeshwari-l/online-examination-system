import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'oes-stat-card',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-stat-card oes-card oes-card--hoverable oes-slide-up">
      <div class="oes-stat-card__top">
        <div class="oes-stat-card__icon" [style.background]="iconBackground()" [style.color]="iconColor()">
          <mat-icon>{{ icon() }}</mat-icon>
        </div>
        @if (trendDirection() !== 'neutral' && trendLabel()) {
          <span class="oes-stat-card__trend oes-stat-card__trend--{{ trendDirection() }}">
            <mat-icon>{{ trendDirection() === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ trendLabel() }}
          </span>
        }
      </div>
      <p class="oes-stat-card__value">{{ value() }}</p>
      <p class="oes-stat-card__label">{{ label() }}</p>
    </div>
  `,
  styles: [`
    .oes-stat-card { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
    .oes-stat-card__top { display: flex; align-items: center; justify-content: space-between; }
    .oes-stat-card__icon {
      width: 46px; height: 46px; border-radius: var(--oes-radius-md);
      display: flex; align-items: center; justify-content: center;
    }
    .oes-stat-card__icon mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .oes-stat-card__trend {
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: var(--oes-radius-full);
    }
    .oes-stat-card__trend mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .oes-stat-card__trend--up { color: var(--oes-success-600); background: rgba(16, 185, 129, 0.12); }
    .oes-stat-card__trend--down { color: var(--oes-danger-600); background: rgba(239, 68, 68, 0.12); }
    .oes-stat-card__value { font-family: var(--oes-font-display); font-size: 28px; font-weight: 800; color: var(--oes-text-primary); }
    .oes-stat-card__label { font-size: 13px; color: var(--oes-text-secondary); }
  `]
})
export class StatCardComponent {
  readonly icon = input<string>('insights');
  readonly value = input<string | number>(0);
  readonly label = input<string>('');
  readonly iconColor = input<string>('#4f46e5');
  readonly iconBackground = input<string>('rgba(99, 102, 241, 0.12)');
  readonly trendLabel = input<string | null>(null);
  readonly trendDirection = input<TrendDirection>('neutral');
}
