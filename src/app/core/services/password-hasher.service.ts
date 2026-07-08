import { Injectable } from '@angular/core';

/**
 * Deterministic client-side hashing so plain-text passwords are never
 * stored directly in LocalStorage. This is a demo-grade hash (there is no
 * real backend to salt/verify against a server) — it exists purely so the
 * stored data model mirrors a real authentication system.
 */
@Injectable({ providedIn: 'root' })
export class PasswordHasherService {
  hash(plainText: string): string {
    let hash = 0;
    const salted = `exampro::${plainText}::salt`;
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `h${Math.abs(hash)}${salted.length}`;
  }

  verify(plainText: string, hashed: string): boolean {
    return this.hash(plainText) === hashed;
  }
}
