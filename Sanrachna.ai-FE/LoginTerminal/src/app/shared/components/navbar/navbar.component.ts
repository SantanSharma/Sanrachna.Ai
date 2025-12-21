import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Navbar Component
 * Main navigation bar displayed on authenticated pages.
 * Shows logo, navigation links, and user dropdown menu.
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
          <a routerLink="/dashboard" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span class="text-white font-bold text-sm">S</span>
            </div>
            <span class="text-white font-semibold text-lg hidden sm:block">Sanrachna Portal</span>
          </a>

          <!-- User Dropdown (Works on all screen sizes) -->
          <div class="relative">
            <button 
              (click)="toggleDropdown($event)"
              class="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              @if (authService.currentUser()?.avatarUrl) {
                <img 
                  [src]="authService.currentUser()?.avatarUrl" 
                  [alt]="authService.currentUser()?.name || 'User'"
                  class="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                  (error)="onImageError($event)"
                />
              } @else {
                <div class="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <span class="material-icons-outlined text-purple-400 text-lg">person</span>
                </div>
              }
              <span class="text-gray-300 text-sm hidden sm:block">
                {{ authService.currentUser()?.name || 'User' }}
              </span>
              <span class="material-icons-outlined text-gray-400 text-lg">
                {{ dropdownOpen() ? 'expand_less' : 'expand_more' }}
              </span>
            </button>

            <!-- Dropdown Menu -->
            @if (dropdownOpen()) {
              <div class="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                <!-- User Info Header -->
                <div class="px-4 py-3 border-b border-dark-border">
                  <p class="text-sm font-medium text-white truncate">{{ authService.currentUser()?.name }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ authService.currentUser()?.email }}</p>
                </div>
                
                <!-- Dashboard link (Mobile only) -->
                <div class="md:hidden py-1 border-b border-dark-border">
                  <a 
                    routerLink="/dashboard" 
                    (click)="closeDropdown()"
                    class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <span class="material-icons-outlined text-lg">dashboard</span>
                    <span>Dashboard</span>
                  </a>
                </div>

                <!-- Menu Items -->
                <div class="py-1">
                  <a 
                    routerLink="/profile" 
                    (click)="closeDropdown()"
                    class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <span class="material-icons-outlined text-lg">account_circle</span>
                    <span>Profile</span>
                  </a>
                  <a 
                    routerLink="/settings" 
                    (click)="closeDropdown()"
                    class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <span class="material-icons-outlined text-lg">settings</span>
                    <span>Settings</span>
                  </a>
                </div>
                
                <!-- Admin Panel (Only for admin users) -->
                @if (isAdmin()) {
                  <div class="border-t border-dark-border py-1">
                    <a 
                      routerLink="/admin" 
                      (click)="closeDropdown()"
                      class="flex items-center gap-3 px-4 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-slate-700 transition-colors"
                    >
                      <span class="material-icons-outlined text-lg">admin_panel_settings</span>
                      <span>Admin Panel</span>
                    </a>
                  </div>
                }
                
                <!-- Logout -->
                <div class="border-t border-dark-border pt-1">
                  <a 
                    routerLink="/logout" 
                    (click)="closeDropdown()"
                    class="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                  >
                    <span class="material-icons-outlined text-lg">logout</span>
                    <span>Sign Out</span>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  
  dropdownOpen = signal(false);
  
  // Check if current user is admin
  isAdmin = computed(() => {
    const user = this.authService.currentUser();
    return user?.role?.toLowerCase() === 'admin';
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown when clicking outside
    if (this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(open => !open);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
