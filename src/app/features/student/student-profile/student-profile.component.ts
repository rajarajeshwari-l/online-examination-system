import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService, ToastService } from '../../../core/services';
import { AttemptService } from '../../../core/services/attempt.service';
import { PageHeaderComponent, AvatarComponent, StatCardComponent } from '../../../shared/components';
import { StudentUser } from '../../../core/models';

@Component({
  selector: 'oes-student-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    AvatarComponent,
    StatCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css'
})
export class StudentProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly attemptService = inject(AttemptService);

  private readonly currentStudent = computed<StudentUser | undefined>(() => {
    const session = this.authService.session();
    if (!session) return undefined;
    const user = this.authService.getUserById(session.userId);
    return user?.role === 'student' ? user : undefined;
  });

  readonly myAttempts = computed(() =>
    this.attemptService.getByStudent(this.currentStudent()?.id ?? '').filter((a) => a.status !== 'in-progress')
  );

  readonly averageScore = computed(() => {
    const attempts = this.myAttempts();
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
  });

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    batch: ['', [Validators.required]]
  });

  constructor() {
    const student = this.currentStudent();
    if (student) {
      this.form.setValue({
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        batch: student.batch
      });
    }
  }

  saveProfile(): void {
    const student = this.currentStudent();
    if (!student || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: StudentUser = { ...student, ...this.form.getRawValue() };
    this.authService.updateUser(updated);
    this.toastService.success('Profile updated', 'Your changes have been saved.');
  }
}
