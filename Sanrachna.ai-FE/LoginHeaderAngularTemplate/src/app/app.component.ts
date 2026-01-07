import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SsoAuthService } from './core';
import { HeaderComponent } from './components';

/**
 * ============================================================================
 * App Component - LoginHeaderAngularTemplate
 * ============================================================================
 *
 * Root component of the application.
 * Handles:
 * - SSO authentication initialization
 * - Global header display
 * - Route outlet for page content
 *
 * ============================================================================
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <!-- Header (visible when authenticated) -->
    @if (authService.isAuthenticated()) {
      <app-header></app-header>
    }

    <!-- Main Content -->
    <main class="min-h-screen bg-slate-950">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #020617;
    }
  `]
})
export class AppComponent implements OnInit {
  authService = inject(SsoAuthService);

  ngOnInit(): void {
    // Initialize SSO authentication
    const isAuthenticated = this.authService.initializeAuth();

    if (isAuthenticated) {
      // Setup visibility listener for detecting logout from other apps
      this.authService.setupVisibilityListener();
    }
  }
}
