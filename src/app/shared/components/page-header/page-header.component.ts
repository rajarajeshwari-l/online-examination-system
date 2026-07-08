import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'oes-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-page-header oes-fade-in">
      <div class="oes-page-header__text">
        <h1 class="oes-page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="oes-page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="oes-page-header__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .oes-page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }
    .oes-page-header__title {
      font-size: clamp(22px, 3vw, 28px);
    }
    .oes-page-header__subtitle {
      margin-top: 6px;
      font-size: 14px;
      max-width: 560px;
    }
    .oes-page-header__actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  `]
})
export class PageHeaderComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string | null>(null);
}
