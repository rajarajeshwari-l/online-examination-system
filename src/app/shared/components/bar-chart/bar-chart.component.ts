import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarChartDatum {
  label: string;
  value: number;
}

@Component({
  selector: 'oes-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-bar-chart">
      @for (bar of bars(); track bar.label) {
        <div class="oes-bar-chart__column">
          <div class="oes-bar-chart__track">
            <div
              class="oes-bar-chart__fill"
              [style.height.%]="bar.percentage"
              [style.background]="color()"
            >
              <span class="oes-bar-chart__value">{{ bar.value }}</span>
            </div>
          </div>
          <span class="oes-bar-chart__label">{{ bar.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .oes-bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      height: 220px;
      padding-top: 24px;
    }
    .oes-bar-chart__column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      gap: 8px;
    }
    .oes-bar-chart__track {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      background: var(--oes-bg-sunken);
      border-radius: var(--oes-radius-sm);
      overflow: hidden;
    }
    .oes-bar-chart__fill {
      width: 100%;
      border-radius: var(--oes-radius-sm) var(--oes-radius-sm) 0 0;
      min-height: 4px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 6px;
      transition: height var(--oes-transition-slow);
    }
    .oes-bar-chart__value {
      font-size: 11px;
      font-weight: 700;
      color: #fff;
    }
    .oes-bar-chart__label {
      font-size: 12px;
      color: var(--oes-text-secondary);
      font-weight: 500;
      text-align: center;
    }
  `]
})
export class BarChartComponent {
  readonly data = input.required<BarChartDatum[]>();
  readonly color = input<string>('var(--oes-primary-500)');

  readonly bars = computed(() => {
    const items = this.data();
    const max = Math.max(...items.map((d) => d.value), 1);
    return items.map((d) => ({ ...d, percentage: Math.max((d.value / max) * 100, d.value > 0 ? 6 : 0) }));
  });
}
