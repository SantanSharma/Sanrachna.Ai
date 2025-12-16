import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationService } from '../../core/services/application.service';
import { ToastService } from '../../core/services/toast.service';
import { Application, ApplicationCategory } from '../../core/models/application.model';

/**
 * Dashboard Component
 * Main landing page after login.
 * Displays application cards grouped by category with search and view options.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, AppIconComponent],
  template: `
    <div class="page-container">
      <app-navbar></app-navbar>

      <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Application Dashboard</h1>
          <p class="text-gray-400">Click any application to launch with Single Sign-On</p>
        </div>

        <!-- Search and View Toggle -->
        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <!-- Search Input -->
          <div class="relative flex-1">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <span class="material-icons-outlined text-xl">search</span>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterApplications()"
              class="w-full px-4 py-3 pl-12 rounded-lg bg-dark-card border border-dark-border text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search applications..."
            />
          </div>

          <!-- View Toggle -->
          <div class="flex items-center gap-1 bg-dark-card border border-dark-border rounded-lg p-1">
            <button
              (click)="viewMode.set('grid')"
              class="p-2 rounded-md transition-colors"
              [class.bg-blue-500]="viewMode() === 'grid'"
              [class.text-white]="viewMode() === 'grid'"
              [class.text-gray-400]="viewMode() !== 'grid'"
              [class.hover:text-white]="viewMode() !== 'grid'"
            >
              <span class="material-icons-outlined text-lg">grid_view</span>
            </button>
            <button
              (click)="viewMode.set('list')"
              class="p-2 rounded-md transition-colors"
              [class.bg-blue-500]="viewMode() === 'list'"
              [class.text-white]="viewMode() === 'list'"
              [class.text-gray-400]="viewMode() !== 'list'"
              [class.hover:text-white]="viewMode() !== 'list'"
            >
              <span class="material-icons-outlined text-lg">view_list</span>
            </button>
          </div>
        </div>

        <!-- Applications by Category -->
        @if (isLoading()) {
          <div class="flex items-center justify-center py-20">
            <div class="animate-spin">
              <span class="material-icons-outlined text-4xl text-blue-500">refresh</span>
            </div>
          </div>
        } @else {
          @for (category of categories(); track category) {
            @if (getAppsByCategory(category).length > 0) {
              <div class="mb-8 animate-fade-in">
                <h2 class="text-lg font-semibold text-gray-300 mb-4">{{ category }}</h2>
                
                @if (viewMode() === 'grid') {
                  <!-- Grid View -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    @for (app of getAppsByCategory(category); track app.id) {
                      <div
                        (click)="launchApp(app)"
                        class="app-card group"
                        [class.opacity-50]="!app.isSupported"
                        [class.cursor-not-allowed]="!app.isSupported"
                      >
                        <app-icon
                          [icon]="app.icon"
                          [colorClass]="app.iconColor"
                          size="md"
                        ></app-icon>
                        <h3 class="text-white font-medium">{{ app.name }}</h3>
                        <p class="text-gray-400 text-sm text-center">{{ app.description }}</p>
                        
                        @if (!app.isSupported) {
                          <span class="text-xs text-yellow-500 mt-1">Coming Soon</span>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <!-- List View -->
                  <div class="space-y-2">
                    @for (app of getAppsByCategory(category); track app.id) {
                      <div
                        (click)="launchApp(app)"
                        class="flex items-center gap-4 p-4 bg-dark-card border border-dark-border rounded-lg hover:border-blue-500/50 transition-all cursor-pointer"
                        [class.opacity-50]="!app.isSupported"
                        [class.cursor-not-allowed]="!app.isSupported"
                      >
                        <app-icon
                          [icon]="app.icon"
                          [colorClass]="app.iconColor"
                          size="sm"
                        ></app-icon>
                        <div class="flex-1">
                          <h3 class="text-white font-medium">{{ app.name }}</h3>
                          <p class="text-gray-400 text-sm">{{ app.description }}</p>
                        </div>
                        @if (!app.isSupported) {
                          <span class="text-xs text-yellow-500 px-2 py-1 bg-yellow-500/10 rounded">Coming Soon</span>
                        } @else {
                          <span class="material-icons-outlined text-gray-500 group-hover:text-blue-400">arrow_forward</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }

          @if (filteredApps().length === 0) {
            <div class="text-center py-20">
              <span class="material-icons-outlined text-6xl text-gray-600 mb-4">search_off</span>
              <p class="text-gray-400 text-lg">No applications found</p>
              <p class="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private applicationService = inject(ApplicationService);
  private toastService = inject(ToastService);

  // State
  applications = signal<Application[]>([]);
  filteredApps = signal<Application[]>([]);
  isLoading = signal(true);
  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = '';

  // Computed categories
  categories = signal<ApplicationCategory[]>([]);

  ngOnInit(): void {
    this.loadApplications();
  }

  private loadApplications(): void {
    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        // Store all applications
        this.applications.set(apps);
        // Filter to show supported apps initially
        this.filteredApps.set(apps.filter(a => a.isSupported));
        
        // Get unique categories
        const uniqueCategories = [...new Set(apps.map(a => a.category))];
        this.categories.set(uniqueCategories);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Error', error.message || 'Failed to load applications');
        this.isLoading.set(false);
      }
    });
  }

  filterApplications(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredApps.set(this.applications().filter(a => a.isSupported));
      return;
    }

    const filtered = this.applications().filter(app => 
      app.isSupported && (
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
      )
    );

    this.filteredApps.set(filtered);
  }

  getAppsByCategory(category: ApplicationCategory): Application[] {
    return this.filteredApps().filter(app => app.category === category);
  }

  launchApp(app: Application): void {
    if (!app.isSupported) {
      this.toastService.info('Coming Soon', `${app.name} will be available soon.`);
      return;
    }

    // Get token for SSO
    const token = this.authService.getToken();
    
    // Build URL with SSO token
    const ssoUrl = `${app.url}?token=${encodeURIComponent(token || '')}`;
    
    this.toastService.info('Launching', `Opening ${app.name}...`);
    
    // Open in new tab
    window.open(ssoUrl, '_blank');
  }
}
