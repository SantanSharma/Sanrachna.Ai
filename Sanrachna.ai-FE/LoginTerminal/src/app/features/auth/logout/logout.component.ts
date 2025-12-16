import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Logout Component
 * Confirmation page for signing out.
 * Shows user information and provides sign-out/cancel options.
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
          <h1 class="text-2xl font-semibold text-white mb-2">Sign Out</h1>
          <p class="text-gray-400">Are you sure you want to sign out?</p>
        </div>

        <!-- Logout Card -->
        <div class="card">
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
        </div>

        <!-- Security Notice -->
        <p class="text-center text-gray-500 text-sm mt-6">
          Remember to sign out on shared devices
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LogoutComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isLoggingOut = false;

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
