import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProfileDropdownComponent } from '../../core/components';

/**
 * Header Component for Anti-Goal
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UserProfileDropdownComponent],
  template: `
    <header class="bg-antigoal-bg border-b border-antigoal-border sticky top-0 z-50">
      <div class="max-w-3xl mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-antigoal-neutral to-antigoal-warning-muted flex items-center justify-center">
              <span class="text-white font-medium text-sm">AG</span>
            </div>
            <span class="text-lg font-medium text-antigoal-text group-hover:text-white transition-colors">
              Anti-Goal
            </span>
          </a>

          <!-- Navigation -->
          <nav class="flex items-center gap-1">
            <a
              routerLink="/dashboard"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link px-3 py-2 rounded-lg text-sm text-antigoal-text-muted hover:text-antigoal-text hover:bg-antigoal-card transition-colors"
            >
              Dashboard
            </a>

            <a
              routerLink="/timeline"
              routerLinkActive="active-link"
              class="nav-link px-3 py-2 rounded-lg text-sm text-antigoal-text-muted hover:text-antigoal-text hover:bg-antigoal-card transition-colors"
            >
              Timeline
            </a>

            <!-- User Profile Dropdown -->
            <div class="ml-2">
              <app-user-profile-dropdown
                [showName]="true"
                avatarGradient="linear-gradient(135deg, #64748b 0%, #475569 100%)"
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
      color: #94a3b8;
    }
  `]
})
export class HeaderComponent {}
