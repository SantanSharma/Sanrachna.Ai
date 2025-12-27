import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Register Component
 * Provides user registration with full name, email, password, and confirmation.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="w-full max-w-md animate-fade-in">
        <!-- Logo Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-glow">
            <span class="material-icons-outlined text-white text-3xl">person_add</span>
          </div>
        </div>

        <!-- Title -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-white mb-2">Create Account</h1>
          <p class="text-gray-400">Join us to access all applications</p>
        </div>

        <!-- Register Form Card -->
        <div class="card">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Full Name Field -->
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <span class="material-icons-outlined text-xl">person</span>
                </span>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  class="input-field"
                  placeholder="John Doe"
                  [class.border-red-500]="isFieldInvalid('name')"
                />
              </div>
              @if (isFieldInvalid('name')) {
                <p class="mt-1 text-sm text-red-400">
                  @if (registerForm.get('name')?.hasError('required')) {
                    Full name is required
                  } @else if (registerForm.get('name')?.hasError('minlength')) {
                    Name must be at least 2 characters
                  }
                </p>
              }
            </div>

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
                  @if (registerForm.get('email')?.hasError('required')) {
                    Email is required
                  } @else if (registerForm.get('email')?.hasError('email')) {
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
                  @if (registerForm.get('password')?.hasError('required')) {
                    Password is required
                  } @else if (registerForm.get('password')?.hasError('minlength')) {
                    Password must be at least 8 characters
                  }
                </p>
              }
            </div>

            <!-- Confirm Password Field -->
            <div class="mb-6">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <span class="material-icons-outlined text-xl">lock</span>
                </span>
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="input-field pr-12"
                  placeholder="••••••••"
                  [class.border-red-500]="isFieldInvalid('confirmPassword')"
                />
                <button
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <span class="material-icons-outlined text-xl">
                    {{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
              @if (isFieldInvalid('confirmPassword')) {
                <p class="mt-1 text-sm text-red-400">
                  @if (registerForm.get('confirmPassword')?.hasError('required')) {
                    Please confirm your password
                  } @else if (registerForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                    Passwords do not match
                  }
                </p>
              }
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
                <span>Creating account...</span>
              } @else {
                <span>Create Account</span>
              }
            </button>
          </form>

          <!-- Login Link -->
          <p class="text-center text-gray-400 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(show => !show);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { name, email, password, confirmPassword } = this.registerForm.value;

    this.authService.register({ name, email, password, confirmPassword }).subscribe({
      next: () => {
        this.toastService.success('Account Created!', 'Welcome to Sanrachna Portal.');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toastService.error('Registration Failed', error.message || 'Could not create account');
      }
    });
  }
}
