import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
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
  imports: [CommonModule, NavbarComponent],
  template: `
    <div class="page-container">
      <app-navbar></app-navbar>

      <main class="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Settings</h1>
          <p class="text-gray-400">Manage your preferences</p>
        </div>

        <!-- Theme Settings Card -->
        <div class="card">
          <h3 class="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span class="material-icons-outlined text-gray-400">palette</span>
            Theme Settings
          </h3>
          
          <div class="space-y-3">
            @for (option of themeOptions; track option.value) {
              <label
                class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-dark-input border border-dark-border cursor-pointer hover:border-blue-500/50 transition-colors"
                [class.border-blue-500]="themeService.themeMode() === option.value"
              >
                <input
                  type="radio"
                  name="theme"
                  [value]="option.value"
                  [checked]="themeService.themeMode() === option.value"
                  (change)="onThemeChange(option.value)"
                  class="w-4 h-4 text-blue-500 bg-dark-input border-dark-border focus:ring-blue-500 focus:ring-offset-dark-bg flex-shrink-0"
                />
                <span class="material-icons-outlined text-gray-400 flex-shrink-0">{{ option.icon }}</span>
                <div class="min-w-0">
                  <p class="text-white font-medium">{{ option.label }}</p>
                  <p class="text-gray-400 text-sm truncate sm:whitespace-normal">{{ option.description }}</p>
                </div>
              </label>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
  protected themeService = inject(ThemeService);
  private toastService = inject(ToastService);

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

  onThemeChange(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
    this.toastService.success('Theme Updated', `Theme changed to ${theme}.`);
  }
}
