import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ============================================================================
 * Home Page Component
 * ============================================================================
 *
 * A simple home page to demonstrate the template is working.
 * Replace this with your actual application content.
 *
 * ============================================================================
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-white mb-4">
          Welcome to Test App Name
        </h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          This is a sample Angular template application with SSO authentication.
          The header above shows your logged-in user profile.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        @for (feature of features; track feature.title) {
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-app-500 transition-colors">
            <div class="w-12 h-12 bg-gradient-to-br from-app-400 to-app-600 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">{{ feature.icon }}</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-slate-400">{{ feature.description }}</p>
          </div>
        }
      </div>

      <!-- Info Card -->
      <div class="bg-slate-800/30 rounded-xl p-8 border border-slate-700">
        <h2 class="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <div class="space-y-4 text-slate-300">
          <p>
            This template includes:
          </p>
          <ul class="list-disc list-inside space-y-2 text-slate-400">
            <li>SSO Authentication with Login Terminal integration</li>
            <li>User profile dropdown with logout functionality</li>
            <li>Tailwind CSS for styling</li>
            <li>Angular 18 standalone components</li>
            <li>TypeScript strict mode</li>
          </ul>
          <p class="pt-4 text-sm text-slate-500">
            To customize this app, modify the <code class="text-app-400">app.config.ts</code> file for SSO settings
            and <code class="text-app-400">header.component.ts</code> to change the app name.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HomeComponent {
  features = [
    {
      icon: '🔐',
      title: 'SSO Authentication',
      description: 'Pre-configured Single Sign-On integration with the Login Terminal application.'
    },
    {
      icon: '👤',
      title: 'User Profile',
      description: 'Built-in user profile dropdown showing authenticated user information.'
    },
    {
      icon: '🎨',
      title: 'Tailwind CSS',
      description: 'Modern utility-first CSS framework for rapid UI development.'
    }
  ];
}
