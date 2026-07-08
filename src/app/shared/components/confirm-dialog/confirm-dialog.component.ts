import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogData } from '../../../core/models';

@Component({
  selector: 'oes-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-confirm">
      <div class="oes-confirm__icon" [class.oes-confirm__icon--danger]="data.variant === 'danger'">
        <mat-icon>{{ data.icon ?? 'help_outline' }}</mat-icon>
      </div>
      <h2 mat-dialog-title class="oes-confirm__title">{{ data.title }}</h2>
      <mat-dialog-content class="oes-confirm__message">{{ data.message }}</mat-dialog-content>
      <mat-dialog-actions class="oes-confirm__actions" align="end">
        <button mat-stroked-button [mat-dialog-close]="false">{{ data.cancelLabel ?? 'Cancel' }}</button>
        <button
          mat-flat-button
          [color]="data.variant === 'danger' ? 'warn' : 'primary'"
          [mat-dialog-close]="true"
          cdkFocusInitial
        >
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .oes-confirm { padding: 8px 4px; text-align: center; }
    .oes-confirm__icon {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      background: var(--oes-primary-50);
      color: var(--oes-primary-600);
    }
    .oes-confirm__icon--danger { background: #fee2e2; color: var(--oes-danger-600); }
    .oes-confirm__icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .oes-confirm__title { font-size: 18px; margin-bottom: 4px; }
    .oes-confirm__message { color: var(--oes-text-secondary); font-size: 14px; line-height: 1.5; }
    .oes-confirm__actions { margin-top: 20px; padding: 0; gap: 8px; }
  `]
})
export class ConfirmDialogComponent {
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
