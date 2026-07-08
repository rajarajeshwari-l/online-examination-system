import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'oes-countdown-timer',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-timer" [class.oes-timer--critical]="isCritical()" [class.oes-timer--warning]="isWarning()">
      <mat-icon>timer</mat-icon>
      <span class="oes-timer__value">{{ formatted() }}</span>
    </div>
  `,
  styles: [`
    .oes-timer {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--oes-radius-full);
      background: var(--oes-primary-50);
      color: var(--oes-primary-700);
      font-family: var(--oes-font-display);
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.02em;
      transition: background var(--oes-transition-base), color var(--oes-transition-base);
    }
    html.dark-theme .oes-timer { background: rgba(99, 102, 241, 0.14); color: var(--oes-primary-300); }
    .oes-timer--warning { background: rgba(245, 158, 11, 0.16); color: var(--oes-warning-600); }
    .oes-timer--critical {
      background: rgba(239, 68, 68, 0.16);
      color: var(--oes-danger-600);
      animation: oesPulse 1s ease infinite;
    }
    .oes-timer mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `]
})
export class CountdownTimerComponent implements OnInit {
  /** Initial remaining seconds; component owns the countdown internally. */
  readonly initialSeconds = input.required<number>();
  readonly autoStart = input<boolean>(true);

  readonly tick = output<number>();
  readonly expired = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly _remainingSeconds = signal<number>(0);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  readonly remainingSeconds = this._remainingSeconds.asReadonly();
  readonly isWarning = computed(() => this._remainingSeconds() <= 300 && this._remainingSeconds() > 60);
  readonly isCritical = computed(() => this._remainingSeconds() <= 60);

  readonly formatted = computed(() => {
    const total = this._remainingSeconds();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
  });

  ngOnInit(): void {
    this._remainingSeconds.set(this.initialSeconds());
    if (this.autoStart()) {
      this.start();
    }
    this.destroyRef.onDestroy(() => this.stop());
  }

  start(): void {
    this.stop();
    this.intervalId = setInterval(() => {
      const next = this._remainingSeconds() - 1;
      if (next <= 0) {
        this._remainingSeconds.set(0);
        this.tick.emit(0);
        this.stop();
        this.expired.emit();
        return;
      }
      this._remainingSeconds.set(next);
      this.tick.emit(next);
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
