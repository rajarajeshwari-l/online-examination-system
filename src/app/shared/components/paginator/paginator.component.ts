import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'oes-paginator',
  standalone: true,
  imports: [MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-paginator
      class="oes-paginator"
      [length]="length()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="pageSizeOptions()"
      [showFirstLastButtons]="true"
      (page)="pageChange.emit($event)"
    ></mat-paginator>
  `,
  styles: [`
    .oes-paginator {
      background: transparent;
      border-top: 1px solid var(--oes-border-subtle);
    }
  `]
})
export class PaginatorComponent {
  readonly length = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly pageIndex = input<number>(0);
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  readonly pageChange = output<PageEvent>();
}
