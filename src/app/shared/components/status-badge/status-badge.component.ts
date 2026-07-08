import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'oes-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="oes-badge oes-badge--{{ tone() }}">{{ label() }}</span>`,
  styles: [`
    .oes-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--oes-radius-full);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
    }
    .oes-badge--success { background: rgba(16, 185, 129, 0.12); color: var(--oes-success-600); }
    .oes-badge--warning { background: rgba(245, 158, 11, 0.14); color: var(--oes-warning-600); }
    .oes-badge--danger { background: rgba(239, 68, 68, 0.12); color: var(--oes-danger-600); }
    .oes-badge--info { background: rgba(99, 102, 241, 0.12); color: var(--oes-primary-600); }
    .oes-badge--neutral { background: var(--oes-bg-sunken); color: var(--oes-text-secondary); }
  `]
})
export class StatusBadgeComponent {
  readonly label = input<string>('');
  readonly tone = input<BadgeTone>('neutral');
}

/** Maps common domain statuses to a badge tone so callers don't repeat switch logic. */
export function toneForExamStatus(status: string): BadgeTone {
  switch (status) {
    case 'published': return 'success';
    case 'draft': return 'warning';
    case 'archived': return 'neutral';
    default: return 'neutral';
  }
}

export function toneForAttemptStatus(passed: boolean): BadgeTone {
  return passed ? 'success' : 'danger';
}
