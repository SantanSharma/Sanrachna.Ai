import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, ProfileService, FamilyService } from '../../services';
import { StatCardComponent } from '../../shared';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, StatCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome{{ profile()?.fullName ? ', ' + profile()!.fullName.split(' ')[0] : '' }}! 👋
        </h1>
        <p class="text-slate-400">Your financial overview at a glance</p>
      </div>

      <!-- Main Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <!-- Net Worth Card - Featured -->
        <div class="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-app-600 to-accent-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative">
            <p class="text-app-100 text-sm mb-1">Net Worth</p>
            <p class="text-3xl sm:text-4xl font-bold mb-2">
              {{ summary().netWorth | currency:'INR':'symbol':'1.0-0' }}
            </p>
            <p class="text-app-100 text-xs">
              Assets - Liabilities
            </p>
          </div>
        </div>

        <!-- Total Assets -->
        <app-stat-card
          title="Total Assets"
          [value]="summary().totalAssets"
          [isCurrency]="true"
          iconBgClass="bg-green-500/20"
        >
          <svg icon class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </app-stat-card>

        <!-- Total Liabilities -->
        <app-stat-card
          title="Total Liabilities"
          [value]="summary().totalLiabilities"
          [isCurrency]="true"
          iconBgClass="bg-red-500/20"
        >
          <svg icon class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        </app-stat-card>
      </div>

      <!-- Secondary Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <app-stat-card
          title="Immovable Assets"
          [value]="summary().totalImmovableAssets"
          [isCurrency]="true"
          subtitle="Property, Land"
          iconBgClass="bg-purple-500/20"
        >
          <svg icon class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Movable Assets"
          [value]="summary().totalMovableAssets"
          [isCurrency]="true"
          subtitle="Bank, Stocks, Gold"
          iconBgClass="bg-blue-500/20"
        >
          <svg icon class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Family Members"
          [value]="summary().familyMembersCount"
          iconBgClass="bg-teal-500/20"
        >
          <svg icon class="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Monthly EMI"
          [value]="totalEmi()"
          [isCurrency]="true"
          iconBgClass="bg-orange-500/20"
        >
          <svg icon class="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </app-stat-card>
      </div>

      <!-- Detailed Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Assets -->
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Top Assets</h2>
            <a routerLink="/assets" class="text-sm text-app-400 hover:text-app-300">View all →</a>
          </div>

          @if (summary().topAssets.length > 0) {
            <div class="space-y-3">
              @for (asset of summary().topAssets; track asset.name; let i = $index) {
                <div class="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                       [ngClass]="['bg-app-500/20 text-app-400', 'bg-accent-500/20 text-accent-400', 'bg-purple-500/20 text-purple-400'][i]">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ asset.name }}</p>
                    <p class="text-xs text-slate-400">{{ asset.type }}</p>
                  </div>
                  <p class="text-sm font-semibold text-white">{{ asset.value | currency:'INR':'symbol':'1.0-0' }}</p>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-8">
              <p class="text-slate-400 text-sm mb-4">No assets added yet</p>
              <a routerLink="/assets" class="text-app-400 hover:text-app-300 text-sm font-medium">Add your first asset →</a>
            </div>
          }
        </div>

        <!-- Biggest Liability -->
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Liability Overview</h2>
            <a routerLink="/liabilities" class="text-sm text-app-400 hover:text-app-300">View all →</a>
          </div>

          @if (summary().biggestLiability) {
            <div class="mb-6">
              <p class="text-sm text-slate-400 mb-2">Biggest Liability</p>
              <div class="flex items-center gap-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div class="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-white">{{ summary().biggestLiability!.name }}</p>
                  <p class="text-sm text-slate-400">{{ summary().biggestLiability!.type }}</p>
                </div>
                <p class="text-lg font-bold text-red-400">
                  {{ summary().biggestLiability!.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}
                </p>
              </div>
            </div>

            <!-- Distribution -->
            @if (summary().liabilityDistribution.length > 0) {
              <p class="text-sm text-slate-400 mb-3">By Category</p>
              <div class="space-y-2">
                @for (item of summary().liabilityDistribution; track item.category) {
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-slate-300">{{ item.category }}</span>
                      <span class="text-slate-400">{{ item.percentage | number:'1.0-0' }}%</span>
                    </div>
                    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-red-500 rounded-full" [style.width.%]="item.percentage"></div>
                    </div>
                  </div>
                }
              </div>
            }
          } @else {
            <div class="text-center py-8">
              <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-white font-medium mb-1">Debt Free! 🎉</p>
              <p class="text-slate-400 text-sm">No liabilities recorded</p>
            </div>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <a routerLink="/profile" class="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors group">
          <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
            <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-slate-300 group-hover:text-white">My Profile</span>
        </a>

        <a routerLink="/family" class="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors group">
          <div class="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
            <svg class="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-slate-300 group-hover:text-white">Family</span>
        </a>

        <a routerLink="/assets" class="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors group">
          <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
            <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="text-sm font-medium text-slate-300 group-hover:text-white">Assets</span>
        </a>

        <a routerLink="/liabilities" class="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors group">
          <div class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
            <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-slate-300 group-hover:text-white">Liabilities</span>
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);
  private profileService = inject(ProfileService);

  summary = this.dashboardService.summary;
  profile = this.profileService.profile;
  totalEmi = this.dashboardService.totalLiabilities; // Will be replaced with actual EMI
}
