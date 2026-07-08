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
  selector: 'oes-admin-layout',
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
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
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
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Exams', icon: 'assignment', route: '/admin/exams' },
    { label: 'Students', icon: 'groups', route: '/admin/students' },
    { label: 'Analytics', icon: 'bar_chart', route: '/admin/analytics' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' }
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
