import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

/**
 * Profile Component
 * Allows users to view and update their profile information.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  template: `
    <div class="page-container">
      <app-navbar></app-navbar>
      
      <main class="flex-1 py-8">
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-white">Profile Settings</h1>
            <p class="text-gray-400 mt-1">Manage your account information</p>
          </div>

          <!-- Profile Card with Tabs -->
          <div class="bg-dark-card border border-dark-border rounded-xl p-6">
            <!-- Avatar Section -->
            <div class="flex flex-col items-center mb-6 pb-6 border-b border-dark-border">
              <div class="relative mb-4">
                @if (previewUrl() || currentUser()?.avatarUrl) {
                  <img 
                    [src]="previewUrl() || currentUser()?.avatarUrl" 
                    [alt]="currentUser()?.name"
                    class="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                    (error)="onImageError($event)"
                  />
                } @else {
                  <div class="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                    <span class="material-icons-outlined text-purple-400 text-3xl">person</span>
                  </div>
                }
              </div>
              <h2 class="text-lg font-semibold text-white">{{ currentUser()?.name }}</h2>
              <p class="text-gray-400 text-sm">{{ currentUser()?.email }}</p>
            </div>

            <!-- Tab Navigation -->
            <div class="flex overflow-x-auto border-b border-dark-border mb-6 -mx-2 px-2 sm:mx-0 sm:px-0">
              <button
                (click)="activeTab.set('profile')"
                class="tab whitespace-nowrap"
                [class.tab-active]="activeTab() === 'profile'"
              >
                <span class="flex items-center gap-2">
                  <span class="material-icons-outlined text-lg">person</span>
                  <span class="hidden sm:inline">Profile</span>
                </span>
              </button>
              <button
                (click)="activeTab.set('password')"
                class="tab whitespace-nowrap"
                [class.tab-active]="activeTab() === 'password'"
              >
                <span class="flex items-center gap-2">
                  <span class="material-icons-outlined text-lg">lock</span>
                  <span class="hidden sm:inline">Password</span>
                </span>
              </button>
            </div>

            <!-- Tab Content -->
            <div class="animate-fade-in">
              @switch (activeTab()) {
                @case ('profile') {
                  <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
                    <!-- Name -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        formControlName="name"
                        class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Your name"
                      />
                      @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
                        <p class="text-red-400 text-sm mt-1">Name is required</p>
                      }
                    </div>

                    <!-- Email (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input 
                        type="email" 
                        [value]="currentUser()?.email"
                        disabled
                        class="w-full px-4 py-3 bg-dark-bg/50 border border-dark-border rounded-lg text-gray-500 cursor-not-allowed"
                      />
                      <p class="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                    </div>

                    <!-- Avatar URL -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                      <input 
                        type="url" 
                        formControlName="avatarUrl"
                        class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/avatar.jpg"
                        (input)="onAvatarUrlChange()"
                      />
                      <p class="text-gray-500 text-xs mt-1">Enter a direct link to your profile picture</p>
                    </div>

                    <!-- Account Info -->
                    <div class="bg-dark-bg rounded-lg p-4 space-y-2">
                      <h3 class="text-sm font-medium text-gray-300 mb-3">Account Information</h3>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Role</span>
                        <span class="text-gray-300 capitalize">{{ currentUser()?.role || 'User' }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Account Status</span>
                        <span class="text-green-400">Active</span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-4 pt-2">
                      <button 
                        type="submit"
                        [disabled]="isLoading() || profileForm.invalid || !profileForm.dirty"
                        class="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        @if (isLoading()) {
                          <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Saving...</span>
                        } @else {
                          <span class="material-icons-outlined text-lg">save</span>
                          <span>Save Changes</span>
                        }
                      </button>
                      <button 
                        type="button"
                        (click)="resetForm()"
                        [disabled]="!profileForm.dirty"
                        class="py-3 px-6 bg-dark-bg border border-dark-border text-gray-300 font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </form>

                  <!-- Profile Messages -->
                  @if (successMessage()) {
                    <div class="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                      <span class="material-icons-outlined text-green-400">check_circle</span>
                      <p class="text-green-400">{{ successMessage() }}</p>
                    </div>
                  }
                  @if (errorMessage()) {
                    <div class="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                      <span class="material-icons-outlined text-red-400">error</span>
                      <p class="text-red-400">{{ errorMessage() }}</p>
                    </div>
                  }
                }

                @case ('password') {
                  <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        formControlName="currentPassword"
                        class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        formControlName="newPassword"
                        class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        formControlName="confirmPassword"
                        class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      [disabled]="passwordForm.invalid || isPasswordLoading()"
                      class="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      @if (isPasswordLoading()) {
                        <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Updating...</span>
                      } @else {
                        <span class="material-icons-outlined text-lg">vpn_key</span>
                        <span>Update Password</span>
                      }
                    </button>
                  </form>

                  <!-- Password Messages -->
                  @if (passwordSuccess()) {
                    <div class="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                      <span class="material-icons-outlined text-green-400">check_circle</span>
                      <p class="text-green-400">{{ passwordSuccess() }}</p>
                    </div>
                  }
                  @if (passwordError()) {
                    <div class="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                      <span class="material-icons-outlined text-red-400">error</span>
                      <p class="text-red-400">{{ passwordError() }}</p>
                    </div>
                  }
                }
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  currentUser = this.authService.currentUser;
  activeTab = signal<'profile' | 'password'>('profile');
  isLoading = signal(false);
  isPasswordLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  passwordSuccess = signal('');
  passwordError = signal('');
  previewUrl = signal<string | null>(null);

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    avatarUrl: ['', [Validators.pattern(/^(https?:\/\/)?.+/)]]
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }

  onAvatarUrlChange(): void {
    const url = this.profileForm.get('avatarUrl')?.value;
    if (url && this.profileForm.get('avatarUrl')?.valid) {
      this.previewUrl.set(url);
    } else {
      this.previewUrl.set(null);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const user = this.currentUser();
    if (!user?.id) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const data = {
      name: this.profileForm.value.name!,
      avatarUrl: this.profileForm.value.avatarUrl || undefined
    };

    this.userService.updateProfile(user.id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Profile updated successfully!');
          this.profileForm.markAsPristine();
          this.previewUrl.set(null);
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update profile');
          setTimeout(() => this.errorMessage.set(''), 5000);
        }
      });
  }

  resetForm(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name || '',
        avatarUrl: user.avatarUrl || ''
      });
      this.profileForm.markAsPristine();
      this.previewUrl.set(null);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    this.previewUrl.set(null);
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError.set('Passwords do not match');
      setTimeout(() => this.passwordError.set(''), 5000);
      return;
    }

    const user = this.currentUser();
    if (!user?.id) return;

    this.isPasswordLoading.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');

    this.userService.changePassword(user.id, { currentPassword, newPassword, confirmPassword })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isPasswordLoading.set(false);
          this.passwordSuccess.set('Password updated successfully!');
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccess.set(''), 3000);
        },
        error: (err) => {
          this.isPasswordLoading.set(false);
          this.passwordError.set(err?.message || 'Failed to update password');
          setTimeout(() => this.passwordError.set(''), 5000);
        }
      });
  }
}
