import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';

import { AuthService } from '../../../core/services';
import { AttemptService } from '../../../core/services/attempt.service';
import { ToastService } from '../../../core/services';
import { ConfirmDialogService } from '../../../shared/components';
import { StudentUser } from '../../../core/models';
import {
  PageHeaderComponent,
  SearchInputComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  AvatarComponent,
  PaginatorComponent
} from '../../../shared/components';

interface StudentRow {
  student: StudentUser;
  attemptCount: number;
  averageScore: number;
}

@Component({
  selector: 'oes-student-management',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    AvatarComponent,
    PaginatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-management.component.html',
  styleUrl: './student-management.component.css'
})
export class StudentManagementComponent {
  private readonly authService = inject(AuthService);
  private readonly attemptService = inject(AttemptService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(8);

  private readonly allRows = computed<StudentRow[]>(() => {
    const students = this.authService.getAllUsers().filter((u): u is StudentUser => u.role === 'student');
    return students.map((student) => {
      const attempts = this.attemptService.getByStudent(student.id).filter((a) => a.status !== 'in-progress');
      const averageScore =
        attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
      return { student, attemptCount: attempts.length, averageScore };
    });
  });

  private readonly filteredRows = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allRows();
    return this.allRows().filter(
      (row) =>
        row.student.fullName.toLowerCase().includes(term) ||
        row.student.email.toLowerCase().includes(term) ||
        row.student.rollNumber.toLowerCase().includes(term)
    );
  });

  readonly totalCount = computed(() => this.filteredRows().length);

  readonly pagedRows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredRows().slice(start, start + this.pageSize());
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  async toggleStatus(row: StudentRow): Promise<void> {
    const nextStatus = row.student.status === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'suspended' ? 'suspend' : 'reactivate';

    const confirmed = await this.confirmDialog.open({
      title: `${nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'} ${row.student.fullName}?`,
      message: `This will ${actionLabel} the student's account and ${nextStatus === 'suspended' ? 'block' : 'restore'} their ability to sign in.`,
      confirmLabel: nextStatus === 'suspended' ? 'Suspend' : 'Reactivate',
      variant: nextStatus === 'suspended' ? 'danger' : 'default',
      icon: nextStatus === 'suspended' ? 'block' : 'check_circle'
    });
    if (!confirmed) return;

    this.authService.updateUser({ ...row.student, status: nextStatus });
    this.toastService.success(`Student ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}`, row.student.fullName);
  }
}
