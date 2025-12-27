import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitStats } from '../../models/habit.model';
import { ContributionGridComponent } from '../../components/contribution-grid/contribution-grid.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ContributionGridComponent, StatCardComponent],
  template: `
    <div class="habit-detail-page min-h-screen bg-standby-bg">
      @if (habit()) {
        <div class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

          <!-- Header -->
          <div class="mb-6 sm:mb-8">
            <a
              routerLink="/habits"
              class="inline-flex items-center gap-2 text-standby-text-muted hover:text-standby-text transition-colors mb-3 sm:mb-4 text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Habits
            </a>

            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="flex items-center gap-3 sm:gap-4">
                <div
                  class="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0"
                  [class]="habitService.getColorClass(habit()!.color)">
                </div>
                <div class="min-w-0">
                  <h1 class="text-xl sm:text-3xl font-bold text-standby-text truncate">{{ habit()!.title }}</h1>
                  @if (habit()!.description) {
                    <p class="text-standby-text-muted mt-1 text-sm sm:text-base line-clamp-2">{{ habit()!.description }}</p>
                  }
                </div>
              </div>

              <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                <a
                  [routerLink]="['/habits', habit()!.id, 'edit']"
                  class="px-3 sm:px-4 py-2 rounded-xl bg-standby-card border border-standby-border text-standby-text hover:bg-standby-card-hover transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>

                <button
                  (click)="onMarkComplete()"
                  [disabled]="isCompletedToday()"
                  class="complete-btn flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base"
                  [class]="isCompletedToday() ? 'bg-standby-accent-green text-white cursor-default' : 'bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80'">
                  @if (isCompletedToday()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="hidden xs:inline">Completed Today</span>
                    <span class="xs:hidden">Done</span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="hidden xs:inline">Mark Complete</span>
                    <span class="xs:hidden">Complete</span>
                  }
                </button>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <app-stat-card
              [value]="stats().currentStreak"
              label="Current Streak"
              iconBgClass="bg-standby-accent-orange/20">
              <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </app-stat-card>

            <app-stat-card
              [value]="stats().longestStreak"
              label="Longest Streak"
              iconBgClass="bg-standby-accent-yellow/20">
              <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </app-stat-card>

            <app-stat-card
              [value]="stats().completedDays + '/' + stats().totalDays"
              label="Days Completed"
              iconBgClass="bg-standby-accent-green/20">
              <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </app-stat-card>

            <app-stat-card
              [value]="stats().completionRate.toFixed(0) + '%'"
              label="Completion Rate"
              iconBgClass="bg-standby-accent-blue/20">
              <svg icon xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-standby-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </app-stat-card>
          </div>

          <!-- Contribution Grid -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border mb-6 sm:mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 class="text-lg sm:text-xl font-semibold text-standby-text">Activity History</h2>
              <div class="flex items-center gap-2 text-xs text-standby-text-muted">
                <span>Not completed</span>
                <div class="w-3 h-3 rounded-sm bg-standby-grid-empty"></div>
                <div class="w-3 h-3 rounded-sm bg-standby-accent-green"></div>
                <span>Completed</span>
              </div>
            </div>

            <div class="overflow-x-auto pb-2 -mx-2 px-2">
              <app-contribution-grid
                [gridData]="gridData()">
              </app-contribution-grid>
            </div>

            <p class="text-xs sm:text-sm text-standby-text-muted mt-3 sm:mt-4">
              Click on any past date to toggle completion status
            </p>
          </div>

          <!-- Habit Details -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border">
            <h2 class="text-lg sm:text-xl font-semibold text-standby-text mb-4">Habit Details</h2>

            <div class="grid grid-cols-2 gap-4 sm:gap-6">
              <div>
                <span class="text-xs sm:text-sm text-standby-text-muted">Duration</span>
                <p class="text-standby-text font-medium text-sm sm:text-base">
                  {{ formatDate(habit()!.startDate) }} - {{ formatDate(habit()!.endDate) }}
                </p>
              </div>

              <div>
                <span class="text-xs sm:text-sm text-standby-text-muted">Daily Commitment</span>
                <p class="text-standby-text font-medium text-sm sm:text-base">{{ habit()!.dailyMinutes }} min</p>
              </div>

              <div>
                <span class="text-xs sm:text-sm text-standby-text-muted">Effort Level</span>
                <p>
                  <span class="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium"
                    [class]="getEffortBadgeClass()">
                    {{ habit()!.effortLevel }}
                  </span>
                </p>
              </div>

              @if (habit()!.reminderTime) {
                <div>
                  <span class="text-xs sm:text-sm text-standby-text-muted">Reminder Time</span>
                  <p class="text-standby-text font-medium text-sm sm:text-base">{{ formatTime(habit()!.reminderTime!) }}</p>
                </div>
              }
            </div>
          </div>

        </div>
      } @else {
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="bg-standby-card rounded-2xl p-12 border border-standby-border text-center">
            <h2 class="text-xl font-semibold text-standby-text mb-2">Habit not found</h2>
            <p class="text-standby-text-muted mb-6">This habit doesn't exist or has been deleted.</p>
            <a
              routerLink="/habits"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80 transition-all duration-200">
              Back to Habits
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .habit-detail-page {
      animation: fadeIn 0.3s ease-out;
    }

    .complete-btn:active:not(:disabled) {
      transform: scale(0.98);
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
export class HabitDetailComponent implements OnInit {
  habitService = inject(HabitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  habit = signal<Habit | undefined>(undefined);

  ngOnInit(): void {
    const habitId = this.route.snapshot.paramMap.get('id');
    if (habitId) {
      this.habit.set(this.habitService.getHabitById(habitId));
    }
  }

  stats(): HabitStats {
    const h = this.habit();
    if (!h) {
      return { totalDays: 0, completedDays: 0, currentStreak: 0, longestStreak: 0, completionRate: 0 };
    }
    return this.habitService.calculateStats(h);
  }

  gridData() {
    const h = this.habit();
    if (!h) return [];
    return this.habitService.getCompletionGridData(h, 16);
  }

  isCompletedToday(): boolean {
    const h = this.habit();
    if (!h) return false;
    return this.habitService.isCompletedToday(h.id);
  }

  onMarkComplete(): void {
    const h = this.habit();
    if (h && !this.isCompletedToday()) {
      this.habitService.markTodayCompleted(h.id);
      // Refresh habit data
      this.habit.set(this.habitService.getHabitById(h.id));
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  getEffortBadgeClass(): string {
    const h = this.habit();
    if (!h) return '';

    switch (h.effortLevel) {
      case 'Low':
        return 'bg-standby-accent-green/20 text-standby-accent-green';
      case 'Medium':
        return 'bg-standby-accent-yellow/20 text-standby-accent-yellow';
      case 'High':
        return 'bg-standby-accent-orange/20 text-standby-accent-orange';
      default:
        return 'bg-standby-card-hover text-standby-text-muted';
    }
  }
}
