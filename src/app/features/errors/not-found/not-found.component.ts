import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'oes-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="oes-not-found">
      <div class="oes-not-found__glyph oes-fade-in">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <button mat-flat-button color="primary" (click)="goHome()">
        <mat-icon>home</mat-icon>
        Back to safety
      </button>
    </div>
  `,
  styles: [`
    .oes-not-found {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 10px;
      padding: 24px;
      background: var(--oes-bg-base);
    }
    .oes-not-found__glyph {
      font-family: var(--oes-font-display);
      font-size: 96px;
      font-weight: 800;
      background: var(--oes-gradient-brand);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      line-height: 1;
    }
    .oes-not-found h1 { font-size: 22px; margin-top: 8px; }
    .oes-not-found p { max-width: 360px; margin-bottom: 16px; }
  `]
})
export class NotFoundComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  goHome(): void {
    const role = this.authService.currentRole();
    if (!role) {
      this.router.navigateByUrl('/auth/login');
    } else {
      this.router.navigateByUrl(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  }
}
