import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared';
import { SsoAuthService } from './core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    @if (isAuthenticated()) {
      <div class="min-h-screen bg-slate-900">
        <app-header></app-header>
        <main class="pt-16">
          <router-outlet></router-outlet>
        </main>
      </div>
    } @else {
      <!-- Loading/Redirecting State -->
      <div class="min-h-screen bg-slate-900 flex items-center justify-center">
        <div class="text-center">
          <div class="relative mb-8">
            <div class="w-20 h-20 rounded-full bg-gradient-to-r from-app-500 to-accent-500 flex items-center justify-center mx-auto">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="absolute inset-0 rounded-full border-4 border-t-app-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Viraasat360</h2>
          <p class="text-slate-400 mb-4">Personal Finance & Family Asset Management</p>
          <p class="text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent implements OnInit {
  private ssoAuth = inject(SsoAuthService);

  isAuthenticated = this.ssoAuth.isAuthenticated;

  ngOnInit(): void {
    // Initialize SSO authentication - handles token from URL or redirects to login
    this.ssoAuth.initializeAuth();
    
    // Set up visibility listener for token validation
    this.ssoAuth.setupVisibilityListener();
  }
}
