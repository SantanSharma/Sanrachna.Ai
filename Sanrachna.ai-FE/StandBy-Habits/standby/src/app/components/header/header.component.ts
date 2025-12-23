import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProfileDropdownComponent } from '../../core/components';

/**
 * ============================================================================
 * Header Component
 * ============================================================================
 *
 * Main navigation header for the StandBy application.
 * Uses the reusable UserProfileDropdownComponent for user authentication UI.
 *
 * ============================================================================
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UserProfileDropdownComponent],
  template: `
    <header class="bg-standby-bg border-b border-standby-border sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 sm:gap-3 group">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-standby-accent-blue to-standby-accent-teal flex items-center justify-center">
              <span class="text-white font-bold text-sm sm:text-lg">S</span>
            </div>
            <span class="text-lg sm:text-xl font-semibold text-standby-text group-hover:text-white transition-colors">
              StandBy
            </span>
          </a>

          <!-- Navigation -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <a
              routerLink="/"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-standby-text-muted hover:text-standby-text hover:bg-standby-card transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span class="hidden sm:inline">Dashboard</span>
            </a>

            <a
              routerLink="/habits"
              routerLinkActive="active-link"
              class="nav-link flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-standby-text-muted hover:text-standby-text hover:bg-standby-card transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span class="hidden sm:inline">Habits</span>
            </a>

            <a
              routerLink="/habits/new"
              class="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-xl bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">New Habit</span>
            </a>

            <!-- User Profile Dropdown (Reusable Component) -->
            <div class="ml-2">
              <app-user-profile-dropdown
                [showName]="true"
                avatarGradient="linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)"
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nav-link.active-link {
      background-color: #1e293b;
      color: #3b82f6;
    }
  `]
})
export class HeaderComponent {
  // Component is now clean - all user profile logic is handled by UserProfileDropdownComponent
}
