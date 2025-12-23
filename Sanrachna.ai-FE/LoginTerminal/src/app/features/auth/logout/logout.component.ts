import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Logout Component
 * Confirmation page for signing out.
 * Supports SSO logout from external apps via ssoLogout query param.
 */
@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="w-full max-w-md animate-fade-in">
        <!-- Logo Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <span class="material-icons-outlined text-white text-3xl">logout</span>
          </div>
        </div>

        <!-- Title -->
        <div class="text-center mb-8">
          @if (isSsoLogout) {
            <h1 class="text-2xl font-semibold text-white mb-2">Signing Out...</h1>
            <p class="text-gray-400">Please wait while we sign you out from all applications.</p>
          } @else {
            <h1 class="text-2xl font-semibold text-white mb-2">Sign Out</h1>
            <p class="text-gray-400">Are you sure you want to sign out?</p>
          }
        </div>

        <!-- Logout Card -->
        <div class="card">
          @if (!isSsoLogout) {
            <!-- User Info -->
            <div class="bg-dark-input border border-dark-border rounded-lg p-4 mb-6">
              <p class="text-gray-400 text-sm mb-1">Signed in as</p>
              <p class="text-white font-medium">{{ authService.currentUser()?.name }}</p>
              <p class="text-gray-400 text-sm">{{ authService.currentUser()?.email }}</p>
            </div>

            <!-- Warning Text -->
            <p class="text-gray-400 text-sm mb-6">
              You will be signed out from all applications using Single Sign-On. 
              You can sign back in anytime.
            </p>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                type="button"
                (click)="confirmLogout()"
                [disabled]="isLoggingOut"
                class="btn-danger flex items-center justify-center gap-2"
              >
                @if (isLoggingOut) {
                  <span class="animate-spin">
                    <span class="material-icons-outlined text-xl">refresh</span>
                  </span>
                  <span>Signing out...</span>
                } @else {
                  <span>Yes, Sign Me Out</span>
                }
              </button>

              <button
                type="button"
                routerLink="/dashboard"
                class="btn-secondary flex items-center justify-center gap-2"
              >
                <span class="material-icons-outlined text-lg">arrow_back</span>
                <span>Cancel, Stay Signed In</span>
              </button>
            </div>
          } @else {
            <!-- SSO Logout Loading State -->
            <div class="flex flex-col items-center py-8">
              <div class="animate-spin mb-4">
                <span class="material-icons-outlined text-4xl text-primary">refresh</span>
              </div>
              <p class="text-gray-400">Signing out from all applications...</p>
            </div>
          }
        </div>

        <!-- Security Notice -->
        @if (!isSsoLogout) {
          <p class="text-center text-gray-500 text-sm mt-6">
            Remember to sign out on shared devices
          </p>
        }
      </div>
    </div>
  `,
  styles: []
})
export class LogoutComponent implements OnInit {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  isLoggingOut = false;
  isSsoLogout = false;
  private returnUrl: string | null = null;

  ngOnInit(): void {
    // Check if this is an SSO logout request from an external app
    const params = this.route.snapshot.queryParams;
    this.isSsoLogout = params['ssoLogout'] === 'true';
    this.returnUrl = params['returnUrl'] || null;

    // If SSO logout, perform automatic logout without confirmation
    if (this.isSsoLogout) {
      this.performSsoLogout();
    } else if (!this.authService.isAuthenticated()) {
      // If not authenticated and not SSO logout, redirect to login
      this.router.navigate(['/login']);
    }
  }

  /**
   * Perform SSO logout (automatic, no confirmation)
   */
  private performSsoLogout(): void {
    this.isLoggingOut = true;

    // Helper to redirect after logout
    const redirectAfterLogout = () => {
      if (this.returnUrl) {
        try {
          const decodedUrl = decodeURIComponent(this.returnUrl);
          if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
            window.location.href = decodedUrl;
          } else {
            this.router.navigateByUrl(decodedUrl);
          }
        } catch {
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    };

    // If not authenticated, just redirect (already logged out)
    if (!this.authService.isAuthenticated()) {
      redirectAfterLogout();
      return;
    }

    this.authService.logout().subscribe({
      next: () => redirectAfterLogout(),
      error: () => redirectAfterLogout() // Even on error, redirect
    });
  }

  confirmLogout(): void {
    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => {
        this.toastService.success('Signed Out', 'You have been successfully signed out.');
        // Router navigation is handled by AuthService
      },
      error: (error) => {
        this.isLoggingOut = false;
        this.toastService.error('Error', 'Failed to sign out. Please try again.');
      }
    });
  }
}
