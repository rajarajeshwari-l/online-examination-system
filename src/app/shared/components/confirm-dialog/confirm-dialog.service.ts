import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogData } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  open(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '420px',
      panelClass: 'oes-confirm-dialog-panel',
      autoFocus: false
    });
    return ref.afterClosed().toPromise().then((result) => !!result);
  }

  confirmDelete(itemLabel: string): Promise<boolean> {
    return this.open({
      title: `Delete ${itemLabel}?`,
      message: `This action cannot be undone. Are you sure you want to permanently delete this ${itemLabel.toLowerCase()}?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      icon: 'delete_outline'
    });
  }
}
