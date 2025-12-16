import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container min-h-screen bg-standby-bg flex flex-col">
      <app-header></app-header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="mt-auto">
        <!-- Gradient Border -->
        <div class="h-1 bg-gradient-to-r from-standby-accent-blue via-standby-accent-teal to-standby-accent-green"></div>

        <div class="bg-standby-card py-8 sm:py-10 px-4 sm:px-6">
          <div class="max-w-6xl mx-auto">
            <!-- Main Footer Content -->
            <div class="text-center space-y-3">
              <p class="text-sm sm:text-base text-standby-text-muted">
                © 2025 StandBy. All rights reserved.
              </p>
              <p class="text-xs sm:text-sm text-standby-text-muted/70">
                Build better habits. One day at a time.
              </p>
              <p class="text-xs sm:text-sm text-standby-text-muted pt-2">
                Made by
                <a href="https://sanrachna.space/" target="_blank" rel="noopener noreferrer"
                   class="text-standby-accent-blue hover:text-standby-accent-teal transition-colors font-medium">
                  &#64;santan
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'StandBy';
}
