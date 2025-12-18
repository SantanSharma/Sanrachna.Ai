import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

/**
 * Login Component
 * Provides user authentication with email and password.
 * Matches the dark-themed UI from the design mockups.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="w-full max-w-md animate-fade-in">
        <!-- Logo Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-glow">
            <span class="material-icons-outlined text-white text-3xl">login</span>
          </div>
        </div>

        <!-- Title -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-white mb-2">Welcome Back</h1>
          <p class="text-gray-400">Sign in to access your dashboard</p>
        </div>

        <!-- Login Form Card -->
        <div class="card">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email Field -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <span class="material-icons-outlined text-xl">mail</span>
                </span>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="input-field"
                  placeholder="you@example.com"
                  [class.border-red-500]="isFieldInvalid('email')"
                />
              </div>
              @if (isFieldInvalid('email')) {
                <p class="mt-1 text-sm text-red-400">
                  @if (loginForm.get('email')?.hasError('required')) {
                    Email is required
                  } @else if (loginForm.get('email')?.hasError('email')) {
                    Please enter a valid email address
                  }
                </p>
              }
            </div>

            <!-- Password Field -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <span class="material-icons-outlined text-xl">lock</span>
                </span>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="input-field pr-12"
                  placeholder="••••••••"
                  [class.border-red-500]="isFieldInvalid('password')"
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <span class="material-icons-outlined text-xl">
                    {{ showPassword() ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="mt-1 text-sm text-red-400">
                  @if (loginForm.get('password')?.hasError('required')) {
                    Password is required
                  } @else if (loginForm.get('password')?.hasError('minlength')) {
                    Password must be at least 6 characters
                  }
                </p>
              }
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between mb-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="w-4 h-4 rounded border-dark-border bg-dark-input text-blue-500 focus:ring-blue-500 focus:ring-offset-dark-bg"
                />
                <span class="text-sm text-gray-400">Remember me</span>
              </label>
              <a href="#" class="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="authService.isLoading()"
              class="btn-primary flex items-center justify-center gap-2"
            >
              @if (authService.isLoading()) {
                <span class="animate-spin">
                  <span class="material-icons-outlined text-xl">refresh</span>
                </span>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>

          <!-- Register Link -->
          <p class="text-center text-gray-400 mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </a>
          </p>
        </div>

        <!-- Google Login (Placeholder) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-dark-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-dark-bg text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            (click)="loginWithGoogle()"
            class="mt-4 w-full py-3 px-4 rounded-lg font-medium text-gray-300 bg-dark-card border border-dark-border hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);

  showPassword = signal(false);
  private googleClientId = environment.oauth.google.clientId;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    // Wait for Google script to load
    if (typeof google !== 'undefined' && google.accounts) {
      this.renderGoogleButton();
    } else {
      // If script not loaded yet, wait and retry
      const checkGoogle = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(checkGoogle);
          this.renderGoogleButton();
        }
      }, 100);

      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkGoogle), 5000);
    }
  }

  private renderGoogleButton(): void {
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }

  private handleGoogleCredentialResponse(response: any): void {
    // Run inside Angular zone to ensure change detection works
    this.ngZone.run(() => {
      if (response.credential) {
        this.authService.googleLogin(response.credential).subscribe({
          next: () => {
            this.toastService.success('Welcome!', 'You have successfully signed in with Google.');
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
            this.router.navigateByUrl(returnUrl);
          },
          error: (error) => {
            this.toastService.error('Google Login Failed', error.message || 'Authentication failed');
          }
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password, rememberMe }).subscribe({
      next: () => {
        this.toastService.success('Welcome!', 'You have successfully signed in.');
        
        // Redirect to return URL or dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.toastService.error('Login Failed', error.message || 'Invalid credentials');
      }
    });
  }

  loginWithGoogle(): void {
    // Trigger Google Sign-In popup
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: If prompt doesn't work, show manual message
          this.toastService.info('Google Sign-In', 'Please allow popups or click the Google button again.');
        }
      });
    } else {
      this.toastService.error('Error', 'Google Sign-In is not available. Please refresh the page.');
    }
  }
}
