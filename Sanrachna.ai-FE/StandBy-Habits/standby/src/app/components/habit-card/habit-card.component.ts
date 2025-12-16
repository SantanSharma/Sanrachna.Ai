import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Habit } from '../../models/habit.model';
import { HabitService } from '../../services/habit.service';
import { ContributionGridComponent } from '../contribution-grid/contribution-grid.component';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ContributionGridComponent],
  template: `
    <div
      class="habit-card bg-standby-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-standby-border hover:border-standby-card-hover transition-all duration-300 cursor-pointer group"
      [class.completed-today]="isCompletedToday"
      (click)="onCardClick()">

      <!-- Header -->
      <div class="flex items-start justify-between mb-3 sm:mb-4">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
            [class]="habitService.getColorClass(habit.color)">
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-standby-text group-hover:text-white transition-colors truncate">
            {{ habit.title }}
          </h3>
        </div>

        <!-- Quick Complete Button -->
        <button
          (click)="onQuickComplete($event)"
          class="complete-btn flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-300 shrink-0 ml-2"
          [class]="isCompletedToday ? 'bg-standby-accent-green text-white' : 'bg-standby-card-hover text-standby-text-muted hover:bg-standby-accent-green hover:text-white'"
          [title]="isCompletedToday ? 'Completed!' : 'Mark as completed'">
          @if (isCompletedToday) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          }
        </button>
      </div>

      <!-- Stats Row -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
        <div class="flex items-center gap-1 sm:gap-1.5 text-standby-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          <span>{{ stats.currentStreak }}d</span>
        </div>

        <div class="flex items-center gap-1 sm:gap-1.5 text-standby-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ habit.dailyMinutes }}m</span>
        </div>

        <div class="flex items-center gap-1 sm:gap-1.5 text-standby-text-muted">
          <span class="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs"
            [class]="getEffortBadgeClass()">
            {{ habit.effortLevel }}
          </span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-3 sm:mb-4">
        <div class="flex justify-between items-center mb-1 sm:mb-1.5">
          <span class="text-[10px] sm:text-xs text-standby-text-muted">Progress</span>
          <span class="text-[10px] sm:text-xs font-medium text-standby-text">{{ progressPercentage }}%</span>
        </div>
        <div class="h-1.5 sm:h-2 bg-standby-bg rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            [class]="habitService.getColorClass(habit.color)"
            [style.width.%]="progressPercentage">
          </div>
        </div>
      </div>

      <!-- Mini Contribution Grid -->
      <div class="pt-2 sm:pt-3 border-t border-standby-border">
        <app-contribution-grid
          [gridData]="gridData"
          [compact]="true">
        </app-contribution-grid>
      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      animation: fadeIn 0.3s ease-out;
    }

    .habit-card.completed-today {
      box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.3);
    }

    .complete-btn:active {
      transform: scale(0.95);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .complete-btn.animate-success {
      animation: pulse 0.3s ease-in-out;
    }
  `]
})
export class HabitCardComponent {
  @Input({ required: true }) habit!: Habit;
  @Output() completed = new EventEmitter<string>();
  @Output() cardClicked = new EventEmitter<string>();

  habitService = inject(HabitService);

  get isCompletedToday(): boolean {
    return this.habitService.isCompletedToday(this.habit.id);
  }

  get stats() {
    return this.habitService.calculateStats(this.habit);
  }

  get progressPercentage(): number {
    return this.habitService.getProgressPercentage(this.habit);
  }

  get gridData() {
    return this.habitService.getCompletionGridData(this.habit, 8);
  }

  getEffortBadgeClass(): string {
    const baseClass = 'font-medium ';
    switch (this.habit.effortLevel) {
      case 'Low':
        return baseClass + 'bg-standby-accent-green/20 text-standby-accent-green';
      case 'Medium':
        return baseClass + 'bg-standby-accent-yellow/20 text-standby-accent-yellow';
      case 'High':
        return baseClass + 'bg-standby-accent-orange/20 text-standby-accent-orange';
      default:
        return baseClass + 'bg-standby-card-hover text-standby-text-muted';
    }
  }

  onQuickComplete(event: Event): void {
    event.stopPropagation();
    if (!this.isCompletedToday) {
      this.habitService.markTodayCompleted(this.habit.id);
      this.completed.emit(this.habit.id);
    }
  }

  onCardClick(): void {
    this.cardClicked.emit(this.habit.id);
  }
}
