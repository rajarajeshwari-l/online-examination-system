import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'oes-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-avatar" [style.width.px]="size()" [style.height.px]="size()" [style.background]="color()" [style.fontSize.px]="fontSize()">
      {{ initials() }}
    </div>
  `,
  styles: [`
    .oes-avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-family: var(--oes-font-display);
      flex-shrink: 0;
      letter-spacing: 0.02em;
      box-shadow: var(--oes-shadow-sm);
    }
  `]
})
export class AvatarComponent {
  readonly name = input<string>('');
  readonly color = input<string>('#6366f1');
  readonly size = input<number>(40);

  readonly fontSize = computed(() => Math.round(this.size() * 0.4));

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  });
}
