import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastService } from '../../../core/services';
import { ToastVariant } from '../../../core/models';

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning'
};

@Component({
  selector: 'oes-toast-host',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.css'
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  iconFor(variant: ToastVariant): string {
    return VARIANT_ICON[variant];
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
