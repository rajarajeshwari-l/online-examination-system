import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'oes-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-empty oes-fade-in">
      <div class="oes-empty__icon"><mat-icon>{{ icon() }}</mat-icon></div>
      <h3 class="oes-empty__title">{{ title() }}</h3>
      <p class="oes-empty__description">{{ description() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" class="oes-empty__action" (click)="action.emit()">
          <mat-icon>{{ actionIcon() }}</mat-icon>
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .oes-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 56px 24px;
      gap: 6px;
    }
    .oes-empty__icon {
      width: 72px; height: 72px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--oes-primary-50);
      color: var(--oes-primary-500);
      margin-bottom: 12px;
    }
    html.dark-theme .oes-empty__icon { background: rgba(99, 102, 241, 0.12); }
    .oes-empty__icon mat-icon { font-size: 34px; width: 34px; height: 34px; }
    .oes-empty__title { font-size: 17px; }
    .oes-empty__description { max-width: 360px; font-size: 13.5px; }
    .oes-empty__action { margin-top: 18px; }
  `]
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly title = input<string>('Nothing here yet');
  readonly description = input<string>('There is no data to display right now.');
  readonly actionLabel = input<string | null>(null);
  readonly actionIcon = input<string>('add');
  readonly action = output<void>();
}
