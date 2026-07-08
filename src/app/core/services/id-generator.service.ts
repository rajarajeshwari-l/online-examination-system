import { Injectable } from '@angular/core';

/** Generates collision-resistant IDs without any backend or extra dependency. */
@Injectable({ providedIn: 'root' })
export class IdGeneratorService {
  generate(prefix = 'id'): string {
    const random = Math.random().toString(36).slice(2, 10);
    const time = Date.now().toString(36);
    return `${prefix}_${time}_${random}`;
  }
}
