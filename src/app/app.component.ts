import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './shared/components/toast-host/toast-host.component';
import { GlobalLoadingBarComponent } from './shared/components/global-loading-bar/global-loading-bar.component';
import { SeedDataService } from './core/services';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'oes-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent, GlobalLoadingBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly seedDataService = inject(SeedDataService);
  /** Injected purely to instantiate ThemeService at app startup so the
   *  saved theme class is applied before first paint. */
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.seedDataService.seedIfNeeded();
  }
}
