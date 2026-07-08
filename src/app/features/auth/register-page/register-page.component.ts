import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService, ToastService, LoadingService } from '../../../core/services';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'oes-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly hidePassword = signal(true);

  readonly form = this.formBuilder.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      rollNumber: ['', [Validators.required]],
      batch: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d+\-\s]{7,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    await this.loadingService.simulateDelay(700);

    const { confirmPassword, ...payload } = this.form.getRawValue();
    void confirmPassword;

    const result = this.authService.registerStudent(payload);
    this.isSubmitting.set(false);

    if (!result.success) {
      this.toastService.error('Registration failed', result.message);
      return;
    }

    this.toastService.success('Account created', result.message);
    this.router.navigateByUrl('/student/dashboard');
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
