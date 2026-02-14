import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-900">
      <!-- Sidebar (Desktop) -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 shadow-xl transform transition-transform duration-300 lg:translate-x-0 border-r border-gray-700"
        [class.-translate-x-full]="!isSidebarOpen()"
        [class.translate-x-0]="isSidebarOpen()"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-gray-700">
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span class="text-white text-xl">💰</span>
            </div>
            <div>
              <h1 class="font-bold text-white">YourFinance</h1>
              <p class="text-xs text-gray-400">360° Finance View</p>
            </div>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="p-4 space-y-1">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-900/50 text-primary-400 border-primary-500"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-colors border-l-4 border-transparent"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="font-medium">Dashboard</span>
          </a>

          <a
            routerLink="/transactions"
            routerLinkActive="bg-primary-900/50 text-primary-400 border-primary-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-colors border-l-4 border-transparent"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <span class="font-medium">Transactions</span>
          </a>

          <a
            routerLink="/budget"
            routerLinkActive="bg-primary-900/50 text-primary-400 border-primary-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-colors border-l-4 border-transparent"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span class="font-medium">Budget</span>
          </a>

          <a
            routerLink="/settings"
            routerLinkActive="bg-primary-900/50 text-primary-400 border-primary-500"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-colors border-l-4 border-transparent"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="font-medium">Settings</span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div class="bg-gradient-to-r from-primary-900/50 to-primary-800/50 rounded-xl p-4 border border-primary-700/30">
            <p class="text-sm font-medium text-primary-300 mb-1">Need Help?</p>
            <p class="text-xs text-primary-400/80">Check our documentation for tips on managing your finances.</p>
          </div>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="lg:hidden fixed top-0 inset-x-0 z-30 bg-gray-800 shadow-lg border-b border-gray-700">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            (click)="toggleSidebar()"
            class="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span class="text-white text-sm">💰</span>
            </div>
            <span class="font-bold text-white">YourFinance360</span>
          </div>
          <div class="w-10"></div>
        </div>
      </header>

      <!-- Overlay (Mobile) -->
      <div
        *ngIf="isSidebarOpen()"
        class="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-70"
        (click)="closeSidebar()"
      ></div>

      <!-- Main Content -->
      <main class="lg:ml-64 min-h-screen">
        <div class="pt-16 lg:pt-0 p-4 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class LayoutComponent {
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
