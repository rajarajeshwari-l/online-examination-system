import { ChangeDetectionStrategy, Component, OnDestroy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'oes-search-input',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-search">
      <mat-icon class="oes-search__icon">search</mat-icon>
      <input
        class="oes-search__input oes-focus-ring"
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="term"
        (ngModelChange)="onTermChange($event)"
        aria-label="Search"
      />
      @if (term) {
        <button class="oes-search__clear" type="button" (click)="clear()" aria-label="Clear search">
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .oes-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--oes-surface-card);
      border: 1px solid var(--oes-border-subtle);
      border-radius: var(--oes-radius-md);
      padding: 0 12px;
      height: 44px;
      min-width: 240px;
      transition: border-color var(--oes-transition-fast), box-shadow var(--oes-transition-fast);
    }
    .oes-search:focus-within {
      border-color: var(--oes-primary-400);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .oes-search__icon { color: var(--oes-text-tertiary); font-size: 20px; width: 20px; height: 20px; }
    .oes-search__input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--oes-text-primary);
      font-family: var(--oes-font-body);
      height: 100%;
    }
    .oes-search__input::placeholder { color: var(--oes-text-tertiary); }
    .oes-search__clear {
      border: none; background: none; cursor: pointer;
      display: flex; align-items: center; color: var(--oes-text-tertiary);
      padding: 0;
    }
    .oes-search__clear mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class SearchInputComponent implements OnDestroy {
  readonly placeholder = input<string>('Search...');
  term = '';

  readonly searchChange = output<string>();
  private readonly termChanges$ = new Subject<string>();

  constructor() {
    this.termChanges$.pipe(debounceTime(280), distinctUntilChanged()).subscribe((value) => {
      this.searchChange.emit(value);
    });
  }

  onTermChange(value: string): void {
    this.termChanges$.next(value);
  }

  clear(): void {
    this.term = '';
    this.searchChange.emit('');
  }

  ngOnDestroy(): void {
    this.termChanges$.complete();
  }
}
