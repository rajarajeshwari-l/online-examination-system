import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services';
import { ToastService, LoadingService } from '../../../core/services';

@Component({
  selector: 'oes-login-page',
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
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly hidePassword = signal(true);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly demoAccounts = [
    { label: 'Admin Demo', email: 'admin@exampro.io', password: 'Admin@123', icon: 'admin_panel_settings' },
    { label: 'Student Demo', email: 'liam.carter@student.exampro.io', password: 'Student@123', icon: 'school' }
  ];

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    await this.loadingService.simulateDelay(600);

    const result = this.authService.login(this.form.getRawValue());
    this.isSubmitting.set(false);

    if (!result.success) {
      this.toastService.error('Login failed', result.message);
      return;
    }

    this.toastService.success('Signed in', result.message);
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    const role = this.authService.currentRole();
    this.router.navigateByUrl(redirectTo ?? (role === 'admin' ? '/admin/dashboard' : '/student/dashboard'));
  }

  fillDemo(email: string, password: string): void {
    this.form.setValue({ email, password });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
