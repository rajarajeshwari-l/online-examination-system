import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastVariant } from '../models';
import { IdGeneratorService } from './id-generator.service';

/**
 * Drives the global toast notification stack shown in AppShell.
 * Consumers call convenience methods (success/error/info/warning) and
 * the toast host component reads the `toasts` signal to render them.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly idGenerator = new IdGeneratorService();

  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(variant: ToastVariant, title: string, description?: string, durationMs = 4200): void {
    const toast: ToastMessage = {
      id: this.idGenerator.generate('toast'),
      variant,
      title,
      description,
      durationMs
    };
    this._toasts.update((list) => [...list, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(toast.id), durationMs);
    }
  }

  success(title: string, description?: string): void {
    this.show('success', title, description);
  }

  error(title: string, description?: string): void {
    this.show('error', title, description, 5500);
  }

  info(title: string, description?: string): void {
    this.show('info', title, description);
  }

  warning(title: string, description?: string): void {
    this.show('warning', title, description, 5000);
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
