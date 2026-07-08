import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'oes-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent {
  readonly themeService = inject(ThemeService);

  readonly highlights = [
    { icon: 'bolt', text: 'Auto-graded exams with instant results' },
    { icon: 'shield', text: 'Secure, timed assessments with auto-submit' },
    { icon: 'insights', text: 'Rich analytics for every exam and student' }
  ];
}
