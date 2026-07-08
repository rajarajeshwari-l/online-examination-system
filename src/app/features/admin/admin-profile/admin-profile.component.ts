import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services';
import { ToastService } from '../../../core/services';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { PageHeaderComponent, AvatarComponent, StatCardComponent } from '../../../shared/components';
import { AdminUser } from '../../../core/models';

@Component({
  selector: 'oes-admin-profile',
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
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly analyticsService = inject(AnalyticsService);

  readonly stats = computed(() => this.analyticsService.getOverviewStats());

  private readonly currentAdmin = computed<AdminUser | undefined>(() => {
    const session = this.authService.session();
    if (!session) return undefined;
    const user = this.authService.getUserById(session.userId);
    return user?.role === 'admin' ? user : undefined;
  });

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    department: ['', [Validators.required]]
  });

  constructor() {
    const admin = this.currentAdmin();
    if (admin) {
      this.form.setValue({ fullName: admin.fullName, email: admin.email, department: admin.department });
    }
  }

  saveProfile(): void {
    const admin = this.currentAdmin();
    if (!admin || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: AdminUser = { ...admin, ...this.form.getRawValue() };
    this.authService.updateUser(updated);
    this.toastService.success('Profile updated', 'Your changes have been saved.');
  }
}
