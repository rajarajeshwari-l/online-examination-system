import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { ToastService } from '../services';

/**
 * Catches any error that escapes component/service try-catch blocks and
 * turns it into a friendly toast instead of a blank screen or a console-only
 * failure. Uses an Injector rather than direct DI because ErrorHandler is
 * instantiated very early in the bootstrap process.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    console.error('Unhandled application error:', error);

    try {
      const toastService = this.injector.get(ToastService);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toastService.error('Something went wrong', message);
    } catch {
      // Toast service unavailable during very early bootstrap failures — fail silently.
    }
  }
}
