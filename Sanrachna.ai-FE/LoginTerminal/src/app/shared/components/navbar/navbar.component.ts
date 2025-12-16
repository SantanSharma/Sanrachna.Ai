import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Navbar Component
 * Main navigation bar displayed on authenticated pages.
 * Shows logo, navigation links, and user information.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-dark-bg border-b border-dark-border sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span class="text-white font-bold text-sm">S</span>
            </div>
            <span class="text-white font-semibold text-lg">Sanrachna Portal</span>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-1">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="text-blue-400 bg-blue-500/10"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span class="material-icons-outlined text-lg">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a 
              routerLink="/settings" 
              routerLinkActive="text-blue-400 bg-blue-500/10"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span class="material-icons-outlined text-lg">settings</span>
              <span>Settings</span>
            </a>
            <a 
              routerLink="/logout" 
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span class="material-icons-outlined text-lg">logout</span>
              <span>Logout</span>
            </a>
          </div>

          <!-- User Info -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <span class="material-icons-outlined text-purple-400 text-lg">person</span>
            </div>
            <span class="text-gray-300 text-sm hidden sm:block">
              {{ authService.currentUser()?.name || 'User' }}
            </span>
          </div>

          <!-- Mobile menu button -->
          <button 
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800"
          >
            <span class="material-icons-outlined">
              {{ mobileMenuOpen ? 'close' : 'menu' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileMenuOpen) {
        <div class="md:hidden border-t border-dark-border bg-dark-card">
          <div class="px-4 py-3 space-y-1">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="text-blue-400 bg-blue-500/10"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span class="material-icons-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a 
              routerLink="/settings" 
              routerLinkActive="text-blue-400 bg-blue-500/10"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span class="material-icons-outlined">settings</span>
              <span>Settings</span>
            </a>
            <a 
              routerLink="/logout" 
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span class="material-icons-outlined">logout</span>
              <span>Logout</span>
            </a>
          </div>
        </div>
      }
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
