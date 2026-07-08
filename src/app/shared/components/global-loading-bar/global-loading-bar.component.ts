import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services';

@Component({
  selector: 'oes-global-loading-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.isLoading()) {
      <div class="oes-loading-bar" role="progressbar" aria-label="Loading">
        <div class="oes-loading-bar__fill"></div>
      </div>
    }
  `,
  styles: [`
    .oes-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 4000;
      background: transparent;
      overflow: hidden;
    }
    .oes-loading-bar__fill {
      height: 100%;
      width: 40%;
      background: var(--oes-gradient-brand);
      animation: oesLoadingSlide 1.1s ease-in-out infinite;
    }
    @keyframes oesLoadingSlide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }
  `]
})
export class GlobalLoadingBarComponent {
  readonly loadingService = inject(LoadingService);
}
