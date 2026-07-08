import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Thin, type-safe wrapper around window.localStorage.
 * Every key is namespaced with the app's storage prefix so this app
 * never collides with other data living in the browser's storage.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = environment.storagePrefix;

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.key(key));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.key(key), JSON.stringify(value));
    } catch (error) {
      console.error(`StorageService: failed to persist key "${key}"`, error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.key(key));
  }

  has(key: string): boolean {
    return localStorage.getItem(this.key(key)) !== null;
  }

  clearAppData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}
