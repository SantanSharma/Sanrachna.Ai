import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsoAuthService } from '../auth';

@Component({
  selector: 'app-user-profile-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (user(); as currentUser) {
      <div class="profile-dropdown-container">
        <button
          (click)="toggleDropdown()"
          class="profile-trigger"
          [attr.aria-expanded]="isDropdownOpen()"
          aria-haspopup="true"
        >
          @if (currentUser.avatarUrl) {
            <img
              [src]="currentUser.avatarUrl"
              [alt]="currentUser.name"
              class="avatar-image"
              (error)="onImageError($event)"
            />
          } @else {
            <div class="avatar-fallback" [style.background]="avatarGradient">
              {{ getInitials(currentUser.name) }}
            </div>
          }

          @if (showName) {
            <span class="user-name">{{ currentUser.name }}</span>
          }

          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="chevron-icon"
            [class.rotate-180]="isDropdownOpen()"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        @if (isDropdownOpen()) {
          <div class="dropdown-menu" role="menu">
            <div class="user-info">
              <p class="user-info-name">{{ currentUser.name }}</p>
              <p class="user-info-email">{{ currentUser.email }}</p>
            </div>

            <div class="menu-items">
              <button (click)="onLogout()" class="logout-button" role="menuitem">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        }
      </div>

      @if (isDropdownOpen()) {
        <div class="backdrop" (click)="closeDropdown()" aria-hidden="true"></div>
      }
    }
  `,
  styles: [`
    :host { display: block; position: relative; }
    .profile-dropdown-container { position: relative; }
    .profile-trigger {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.375rem 0.5rem; border-radius: 0.75rem;
      border: none; background: transparent; cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .profile-trigger:hover { background-color: rgba(30, 41, 59, 1); }
    .avatar-image {
      width: 2rem; height: 2rem; border-radius: 9999px;
      object-fit: cover; border: 2px solid #334155;
    }
    .avatar-fallback {
      width: 2rem; height: 2rem; border-radius: 9999px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 0.875rem; font-weight: 500;
    }
    .user-name {
      display: none; font-size: 0.875rem; color: #e2e8f0;
      max-width: 6rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    @media (min-width: 768px) { .user-name { display: block; } }
    .chevron-icon { height: 1rem; width: 1rem; color: #94a3b8; transition: transform 0.2s ease; }
    .chevron-icon.rotate-180 { transform: rotate(180deg); }
    .dropdown-menu {
      position: absolute; right: 0; margin-top: 0.5rem; width: 14rem;
      background-color: #1e293b; border-radius: 0.75rem;
      border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 50;
    }
    .user-info { padding: 0.75rem; border-bottom: 1px solid #334155; }
    .user-info-name { font-size: 0.875rem; font-weight: 500; color: #e2e8f0; margin: 0; }
    .user-info-email { font-size: 0.75rem; color: #94a3b8; margin: 0.25rem 0 0 0; }
    .menu-items { padding: 0.5rem; }
    .logout-button {
      width: 100%; display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #f87171;
      background: transparent; border: none; border-radius: 0.5rem;
      cursor: pointer; transition: background-color 0.15s ease;
    }
    .logout-button:hover { background-color: rgba(239, 68, 68, 0.1); }
    .backdrop { position: fixed; inset: 0; z-index: 40; }
  `]
})
export class UserProfileDropdownComponent {
  private authService = inject(SsoAuthService);

  @Input() showName = true;
  @Input() avatarGradient = 'linear-gradient(135deg, #eab308 0%, #14b8a6 100%)';

  user = this.authService.user;
  isDropdownOpen = signal(false);

  toggleDropdown(): void { this.isDropdownOpen.update(v => !v); }
  closeDropdown(): void { this.isDropdownOpen.set(false); }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onLogout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}
