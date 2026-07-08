import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutArc extends DonutSegment {
  dashArray: string;
  dashOffset: number;
  percentage: number;
}

@Component({
  selector: 'oes-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-donut">
      <svg viewBox="0 0 120 120" class="oes-donut__svg">
        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--oes-bg-sunken)" stroke-width="16" />
        @for (arc of arcs(); track arc.label) {
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            [attr.stroke]="arc.color"
            stroke-width="16"
            stroke-linecap="round"
            [attr.stroke-dasharray]="arc.dashArray"
            [attr.stroke-dashoffset]="arc.dashOffset"
            transform="rotate(-90 60 60)"
          />
        }
      </svg>
      <div class="oes-donut__center">
        <span class="oes-donut__center-value">{{ centerValue() }}</span>
        <span class="oes-donut__center-label">{{ centerLabel() }}</span>
      </div>
    </div>
    <ul class="oes-donut__legend">
      @for (segment of data(); track segment.label) {
        <li>
          <span class="oes-donut__legend-dot" [style.background]="segment.color"></span>
          {{ segment.label }} ({{ segment.value }})
        </li>
      }
    </ul>
  `,
  styles: [`
    .oes-donut { position: relative; width: 140px; height: 140px; margin: 0 auto; }
    .oes-donut__svg { width: 100%; height: 100%; }
    .oes-donut__svg circle { transition: stroke-dasharray var(--oes-transition-slow); }
    .oes-donut__center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .oes-donut__center-value {
      font-family: var(--oes-font-display);
      font-size: 22px;
      font-weight: 800;
      color: var(--oes-text-primary);
    }
    .oes-donut__center-label {
      font-size: 11px;
      color: var(--oes-text-tertiary);
    }
    .oes-donut__legend {
      list-style: none;
      margin: 16px 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }
    .oes-donut__legend li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--oes-text-secondary);
      font-weight: 500;
    }
    .oes-donut__legend-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `]
})
export class DonutChartComponent {
  readonly data = input.required<DonutSegment[]>();
  readonly centerLabel = input<string>('Total');

  private readonly circumference = 2 * Math.PI * 48;

  readonly total = computed(() => this.data().reduce((sum, d) => sum + d.value, 0));
  readonly centerValue = computed(() => this.total());

  readonly arcs = computed<DonutArc[]>(() => {
    const total = this.total() || 1;
    let cumulative = 0;
    return this.data().map((segment) => {
      const percentage = segment.value / total;
      const arcLength = percentage * this.circumference;
      const dashArray = `${arcLength} ${this.circumference - arcLength}`;
      const dashOffset = -cumulative;
      cumulative += arcLength;
      return { ...segment, dashArray, dashOffset, percentage: Math.round(percentage * 100) };
    });
  });
}
