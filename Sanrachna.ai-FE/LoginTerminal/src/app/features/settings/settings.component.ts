import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeMode } from '../../core/models';

/**
 * Settings Component
 * User settings page with Profile, Password, and Appearance tabs.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  template: `
    <div class="page-container">
      <app-navbar></app-navbar>

      <main class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Settings</h1>
          <p class="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <!-- Tabs -->
        <div class="card">
          <!-- Tab Navigation -->
          <div class="flex border-b border-dark-border mb-6">
            <button
              (click)="activeTab.set('profile')"
              class="tab"
              [class.tab-active]="activeTab() === 'profile'"
            >
              <span class="flex items-center gap-2">
                <span class="material-icons-outlined text-lg">person</span>
                Profile
              </span>
            </button>
            <button
              (click)="activeTab.set('password')"
              class="tab"
              [class.tab-active]="activeTab() === 'password'"
            >
              <span class="flex items-center gap-2">
                <span class="material-icons-outlined text-lg">lock</span>
                Password
              </span>
            </button>
            <button
              (click)="activeTab.set('appearance')"
              class="tab"
              [class.tab-active]="activeTab() === 'appearance'"
            >
              <span class="flex items-center gap-2">
                <span class="material-icons-outlined text-lg">palette</span>
                Appearance
              </span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="animate-fade-in">
            @switch (activeTab()) {
              @case ('profile') {
                <div>
                  <h3 class="text-lg font-medium text-white mb-4">Update Profile</h3>
                  
                  <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()">
                    <!-- Full Name -->
                    <div class="mb-4">
                      <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        formControlName="name"
                        class="w-full px-4 py-3 rounded-lg bg-dark-input border border-dark-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <!-- Email (Read-only) -->
                    <div class="mb-4">
                      <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        [value]="authService.currentUser()?.email"
                        readonly
                        class="w-full px-4 py-3 rounded-lg bg-dark-input border border-dark-border text-gray-400 cursor-not-allowed"
                      />
                      <p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <!-- Avatar URL -->
                    <div class="mb-6">
                      <label for="avatarUrl" class="block text-sm font-medium text-gray-300 mb-2">
                        Avatar URL
                      </label>
                      <input
                        id="avatarUrl"
                        type="url"
                        formControlName="avatarUrl"
                        placeholder="https://example.com/avatar.jpg"
                        class="w-full px-4 py-3 rounded-lg bg-dark-input border border-dark-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      [disabled]="profileForm.invalid || isProfileLoading()"
                      class="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      @if (isProfileLoading()) {
                        Saving...
                      } @else {
                        Save Changes
                      }
                    </button>
                  </form>
                </div>
              }
              
              @case ('password') {
                <div>
                  <h3 class="text-lg font-medium text-white mb-4">Change Password</h3>
                  
                  <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()">
                    <!-- Current Password -->
                    <div class="mb-4">
                      <label for="currentPassword" class="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        formControlName="currentPassword"
                        class="w-full px-4 py-3 rounded-lg bg-dark-input border border-dark-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>

                    <!-- New Password -->
                    <div class="mb-4">
                      <label for="newPassword" class="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        formControlName="newPassword"
                        class="w-full px-4 py-3 rounded-lg bg-dark-input border border-dark-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    <!-- Confirm Password -->
                    <div class="mb-6">
                      <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        formControlName="confirmPassword"
                        class="w-full px-4 py-3 rounded-lg bg-dark-input border border-dark-border text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      [disabled]="passwordForm.invalid || isPasswordLoading()"
                      class="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      @if (isPasswordLoading()) {
                        Updating...
                      } @else {
                        Update Password
                      }
                    </button>
                  </form>
                </div>
              }
              
              @case ('appearance') {
                <div>
                  <h3 class="text-lg font-medium text-white mb-4">Theme Settings</h3>
                  
                  <div class="space-y-4">
                    <!-- Theme Options -->
                    @for (option of themeOptions; track option.value) {
                      <label
                        class="flex items-center gap-4 p-4 rounded-lg bg-dark-input border border-dark-border cursor-pointer hover:border-blue-500/50 transition-colors"
                        [class.border-blue-500]="themeService.themeMode() === option.value"
                      >
                        <input
                          type="radio"
                          name="theme"
                          [value]="option.value"
                          [checked]="themeService.themeMode() === option.value"
                          (change)="onThemeChange(option.value)"
                          class="w-4 h-4 text-blue-500 bg-dark-input border-dark-border focus:ring-blue-500 focus:ring-offset-dark-bg"
                        />
                        <span class="material-icons-outlined text-gray-400">{{ option.icon }}</span>
                        <div>
                          <p class="text-white font-medium">{{ option.label }}</p>
                          <p class="text-gray-400 text-sm">{{ option.description }}</p>
                        </div>
                      </label>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class SettingsComponent implements OnInit {
  protected authService = inject(AuthService);
  protected userService = inject(UserService);
  protected themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  activeTab = signal<'profile' | 'password' | 'appearance'>('profile');
  isProfileLoading = signal(false);
  isPasswordLoading = signal(false);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  themeOptions = [
    {
      value: 'dark' as ThemeMode,
      label: 'Dark',
      description: 'Dark theme for low-light environments',
      icon: 'dark_mode'
    },
    {
      value: 'light' as ThemeMode,
      label: 'Light',
      description: 'Light theme for bright environments',
      icon: 'light_mode'
    },
    {
      value: 'system' as ThemeMode,
      label: 'System',
      description: 'Automatically match your system settings',
      icon: 'settings_suggest'
    }
  ];

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    const user = this.authService.currentUser();

    this.profileForm = this.fb.group({
      name: [user?.name || '', [Validators.required, Validators.minLength(2)]],
      avatarUrl: [user?.avatarUrl || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;

    const { name, avatarUrl } = this.profileForm.value;
    this.isProfileLoading.set(true);

    this.userService.updateCurrentUserProfile({ name, avatarUrl }).subscribe({
      next: (updatedUser) => {
        this.isProfileLoading.set(false);
        this.toastService.success('Profile Updated', 'Your profile has been updated successfully.');
        // Update form with returned data
        this.profileForm.patchValue({
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl
        });
      },
      error: (error) => {
        this.isProfileLoading.set(false);
        this.toastService.error('Error', error.message || 'Failed to update profile. Please try again.');
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.toastService.error('Error', 'Passwords do not match.');
      return;
    }

    this.isPasswordLoading.set(true);

    this.userService.changeCurrentUserPassword({ currentPassword, newPassword, confirmPassword }).subscribe({
      next: () => {
        this.isPasswordLoading.set(false);
        this.toastService.success('Password Changed', 'Your password has been updated successfully.');
        this.passwordForm.reset();
      },
      error: (error) => {
        this.isPasswordLoading.set(false);
        this.toastService.error('Error', error.message || 'Failed to change password. Please try again.');
      }
    });
  }

  onThemeChange(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
    this.toastService.success('Theme Updated', `Theme changed to ${theme}.`);
  }
}
