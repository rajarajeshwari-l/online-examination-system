import { Injectable, computed, signal } from '@angular/core';

/**
 * Since this app has no real backend, network latency is simulated in a
 * few key places (initial load, exam submission) purely to give the UI
 * a chance to show its loading skeletons and progress indicators the
 * way a real SaaS product would. This service tracks how many concurrent
 * "tasks" are in flight so overlapping loads don't flicker the UI.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _activeTasks = signal<number>(0);
  readonly isLoading = computed(() => this._activeTasks() > 0);

  start(): void {
    this._activeTasks.update((n) => n + 1);
  }

  stop(): void {
    this._activeTasks.update((n) => Math.max(0, n - 1));
  }

  async wrap<T>(task: () => Promise<T>): Promise<T> {
    this.start();
    try {
      return await task();
    } finally {
      this.stop();
    }
  }

  simulateDelay(ms = 500): Promise<void> {
    this.start();
    return new Promise((resolve) => {
      setTimeout(() => {
        this.stop();
        resolve();
      }, ms);
    });
  }
}
