import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { MotivationBannerComponent } from '../../components/motivation-banner/motivation-banner.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ContributionGridComponent } from '../../components/contribution-grid/contribution-grid.component';
import { HabitCardComponent } from '../../components/habit-card/habit-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MotivationBannerComponent,
    StatCardComponent,
    ContributionGridComponent,
    HabitCardComponent
  ],
  template: `
    <div class="dashboard-page min-h-screen bg-standby-bg">
      <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        <!-- Hero Section -->
        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-bold text-standby-text mb-1 sm:mb-2">
            Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-standby-accent-blue to-standby-accent-teal">StandBy</span>
          </h1>
          <p class="text-standby-text-muted text-sm sm:text-lg">Build habits. Track progress. Stay consistent.</p>
        </div>

        <!-- Motivational Quote -->
        <app-motivation-banner></app-motivation-banner>

        <!-- Stats Overview -->
        <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <app-stat-card
            [value]="habitService.totalHabits()"
            label="Total Habits"
            iconBgClass="bg-standby-accent-blue/20">
            <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </app-stat-card>

          <app-stat-card
            [value]="habitService.habitsCompletedToday() + '/' + habitService.totalHabits()"
            label="Done Today"
            iconBgClass="bg-standby-accent-green/20">
            <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </app-stat-card>

          <app-stat-card
            [value]="habitService.totalCurrentStreak() + 'd'"
            label="Best Streak"
            iconBgClass="bg-standby-accent-orange/20">
            <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </app-stat-card>
        </div>

        <!-- Global Contribution Grid -->
        <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border mb-6 sm:mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 class="text-lg sm:text-xl font-semibold text-standby-text">Your Activity</h2>
            <div class="flex items-center gap-2 text-xs text-standby-text-muted">
              <span>Less</span>
              <div class="flex gap-1">
                <div class="w-3 h-3 rounded-sm bg-standby-grid-empty"></div>
                <div class="w-3 h-3 rounded-sm bg-standby-grid-low"></div>
                <div class="w-3 h-3 rounded-sm bg-standby-grid-medium"></div>
                <div class="w-3 h-3 rounded-sm bg-standby-grid-high"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          @if (habitService.totalHabits() > 0) {
            <div class="overflow-x-auto pb-2 -mx-2 px-2">
              <app-contribution-grid
                [gridData]="globalGridData"
                [showCount]="true"
                [maxCount]="habitService.totalHabits()">
              </app-contribution-grid>
            </div>
            <p class="text-xs sm:text-sm text-standby-text-muted mt-3 sm:mt-4">
              Last 12 weeks of habit completions
            </p>
          } @else {
            <div class="text-center py-6 sm:py-8">
              <p class="text-standby-text-muted mb-4 text-sm sm:text-base">No habits yet. Start building your first habit!</p>
              <a
                routerLink="/habits/new"
                class="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80 transition-all duration-200 text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Habit
              </a>
            </div>
          }
        </div>

        <!-- Today's Habits -->
        @if (habitService.totalHabits() > 0) {
          <div class="mb-6 sm:mb-8">
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h2 class="text-lg sm:text-xl font-semibold text-standby-text">Today's Focus</h2>
              <a
                routerLink="/habits"
                class="text-standby-accent-blue hover:text-standby-accent-blue/80 text-xs sm:text-sm font-medium transition-colors">
                View All →
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              @for (habit of todayHabits; track habit.id) {
                <app-habit-card
                  [habit]="habit"
                  (cardClicked)="onHabitClick($event)">
                </app-habit-card>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class DashboardComponent {
  habitService = inject(HabitService);
  private router = inject(Router);

  get globalGridData() {
    return this.habitService.getGlobalCompletionGrid(12);
  }

  get todayHabits() {
    return this.habitService.habits().slice(0, 6);
  }

  onHabitClick(habitId: string): void {
    this.router.navigate(['/habits', habitId]);
  }
}
