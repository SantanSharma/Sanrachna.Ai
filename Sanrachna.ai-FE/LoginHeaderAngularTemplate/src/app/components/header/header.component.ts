import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileDropdownComponent } from '../../core';

/**
 * ============================================================================
 * Header Component
 * ============================================================================
 *
 * Application header with:
 * - App name on the left
 * - User profile dropdown on the right (SSO authentication)
 *
 * CUSTOMIZATION:
 * - Change appName input to display your app's name
 * - Customize colors using Tailwind classes
 *
 * ============================================================================
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, UserProfileDropdownComponent],
  template: `
    <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left: App Name / Logo -->
          <div class="flex items-center gap-3">
            <!-- Logo Icon -->
            <div class="w-8 h-8 bg-gradient-to-br from-app-400 to-app-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <!-- App Name -->
            <span class="text-xl font-bold text-white">{{ appName }}</span>
          </div>

          <!-- Right: User Profile Dropdown -->
          <div class="flex items-center">
            <app-user-profile-dropdown
              [showName]="true"
              avatarGradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            ></app-user-profile-dropdown>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent {
  /**
   * The application name to display in the header
   * Change this value to customize the header title
   */
  appName = 'Test App Name';
}
