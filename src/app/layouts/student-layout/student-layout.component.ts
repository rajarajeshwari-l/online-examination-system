import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { AuthService } from '../../core/services';
import { ThemeService } from '../../core/services/theme.service';
import { AvatarComponent } from '../../shared/components';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'oes-student-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    AvatarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.css'
})
export class StudentLayoutComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((state) => state.matches)),
    { initialValue: false }
  );

  readonly sidenavOpen = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/student/dashboard' },
    { label: 'Available Exams', icon: 'assignment_turned_in', route: '/student/exams' },
    { label: 'My Attempts', icon: 'history', route: '/student/attempts' },
    { label: 'Profile', icon: 'person', route: '/student/profile' }
  ];

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  closeOnMobile(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
