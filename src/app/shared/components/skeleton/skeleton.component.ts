import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'card' | 'circle' | 'table-row';

@Component({
  selector: 'oes-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'card') {
      <div class="oes-skeleton-card">
        <div class="oes-skeleton oes-skeleton-card__icon"></div>
        <div class="oes-skeleton oes-skeleton-card__line oes-skeleton-card__line--wide"></div>
        <div class="oes-skeleton oes-skeleton-card__line oes-skeleton-card__line--narrow"></div>
      </div>
    } @else if (variant() === 'circle') {
      <div class="oes-skeleton oes-skeleton-circle" [style.width.px]="size()" [style.height.px]="size()"></div>
    } @else if (variant() === 'table-row') {
      <div class="oes-skeleton-row">
        @for (col of columnsArray(); track $index) {
          <div class="oes-skeleton oes-skeleton-row__cell"></div>
        }
      </div>
    } @else {
      <div class="oes-skeleton oes-skeleton-text" [style.width]="width()"></div>
    }
  `,
  styles: [`
    .oes-skeleton-card {
      padding: 20px;
      border-radius: var(--oes-radius-lg);
      background: var(--oes-surface-card);
      border: 1px solid var(--oes-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .oes-skeleton-card__icon { width: 44px; height: 44px; border-radius: var(--oes-radius-md); }
    .oes-skeleton-card__line { height: 12px; }
    .oes-skeleton-card__line--wide { width: 70%; }
    .oes-skeleton-card__line--narrow { width: 40%; }
    .oes-skeleton-text { height: 14px; border-radius: 6px; }
    .oes-skeleton-circle { border-radius: 50%; }
    .oes-skeleton-row { display: flex; gap: 16px; padding: 14px 0; }
    .oes-skeleton-row__cell { flex: 1; height: 16px; }
  `]
})
export class SkeletonComponent {
  readonly variant = input<SkeletonVariant>('text');
  readonly width = input<string>('100%');
  readonly size = input<number>(40);
  readonly columns = input<number>(4);

  columnsArray(): number[] {
    return Array.from({ length: this.columns() });
  }
}
