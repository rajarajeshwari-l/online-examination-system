import { Injectable, effect, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'theme_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.resolveInitialMode());
  readonly mode = this._mode.asReadonly();

  constructor(private readonly storage: StorageService) {
    effect(() => {
      const currentMode = this._mode();
      document.documentElement.classList.toggle('dark-theme', currentMode === 'dark');
      document.documentElement.setAttribute('data-theme', currentMode);
      this.storage.set(THEME_KEY, currentMode);
    });
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  private resolveInitialMode(): ThemeMode {
    const stored = this.storage.get<ThemeMode | null>(THEME_KEY, null);
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
