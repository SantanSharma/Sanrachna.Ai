import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfileDropdownComponent } from '../../../core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, UserProfileDropdownComponent],
  template: `
    <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo and App Name -->
          <a routerLink="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div class="w-10 h-10 bg-gradient-to-br from-app-400 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="hidden sm:block">
              <span class="text-xl font-bold text-white">Viraasat</span>
              <span class="text-xl font-bold text-app-400">360</span>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-slate-800 text-white"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {{ item.label }}
              </a>
            }
          </nav>

          <!-- Right Side: User Profile -->
          <div class="flex items-center gap-4">
            <app-user-profile-dropdown
              [showName]="true"
              avatarGradient="linear-gradient(135deg, #eab308 0%, #14b8a6 100%)"
            ></app-user-profile-dropdown>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav class="md:hidden flex items-center gap-1 pb-3 overflow-x-auto scrollbar-hide">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-slate-800 text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class HeaderComponent {
  navItems = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/profile', label: 'Profile', exact: false },
    { path: '/family', label: 'Family', exact: false },
    { path: '/assets', label: 'Assets', exact: false },
    { path: '/liabilities', label: 'Liabilities', exact: false }
  ];
}
