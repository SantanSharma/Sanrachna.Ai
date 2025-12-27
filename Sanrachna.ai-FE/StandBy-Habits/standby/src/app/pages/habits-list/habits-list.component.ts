import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { HabitCardComponent } from '../../components/habit-card/habit-card.component';

@Component({
  selector: 'app-habits-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HabitCardComponent],
  template: `
    <div class="habits-list-page min-h-screen bg-standby-bg">
      <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-standby-text mb-0.5 sm:mb-1">Your Habits</h1>
            <p class="text-standby-text-muted text-sm sm:text-base">Manage and track all your habits</p>
          </div>
          <a
            routerLink="/habits/new"
            class="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80 transition-all duration-200 font-medium text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Habit
          </a>
        </div>

        <!-- Filter/Sort Bar -->
        <div class="bg-standby-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-standby-border mb-4 sm:mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span class="text-xs sm:text-sm text-standby-text-muted shrink-0">Filter:</span>
              <button
                (click)="setFilter('all')"
                [class]="getFilterButtonClass('all')">
                All
              </button>
              <button
                (click)="setFilter('completed')"
                [class]="getFilterButtonClass('completed')">
                Done
              </button>
              <button
                (click)="setFilter('pending')"
                [class]="getFilterButtonClass('pending')">
                Pending
              </button>
            </div>

            <div class="flex items-center gap-2 sm:ml-auto">
              <span class="text-xs sm:text-sm text-standby-text-muted">Sort:</span>
              <select
                [(ngModel)]="sortBy"
                (change)="onSortChange()"
                class="bg-standby-bg border border-standby-border rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-standby-text focus:outline-none focus:border-standby-accent-blue flex-1 sm:flex-none">
                <option value="name">Name</option>
                <option value="streak">Streak</option>
                <option value="progress">Progress</option>
                <option value="created">Recent</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Habits Grid -->
        @if (filteredHabits.length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            @for (habit of filteredHabits; track habit.id) {
              <app-habit-card
                [habit]="habit"
                (cardClicked)="onHabitClick($event)"
                (completed)="onHabitCompleted($event)">
              </app-habit-card>
            }
          </div>
        } @else if (habitService.totalHabits() === 0) {
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-8 sm:p-12 border border-standby-border text-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-standby-accent-blue/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 text-standby-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-standby-text mb-2">No habits yet</h3>
            <p class="text-standby-text-muted mb-4 sm:mb-6 text-sm sm:text-base">Start your journey by creating your first habit</p>
            <a
              routerLink="/habits/new"
              class="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80 transition-all duration-200 text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Habit
            </a>
          </div>
        } @else {
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-standby-border text-center">
            <p class="text-standby-text-muted text-sm sm:text-base">No habits match your current filter</p>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .habits-list-page {
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
export class HabitsListComponent {
  habitService = inject(HabitService);
  private router = inject(Router);

  currentFilter: 'all' | 'completed' | 'pending' = 'all';
  sortBy: 'name' | 'streak' | 'progress' | 'created' = 'created';

  get filteredHabits() {
    let habits = [...this.habitService.habits()];
    const today = this.habitService.formatDate(new Date());

    // Filter
    if (this.currentFilter === 'completed') {
      habits = habits.filter(h => h.completions[today]);
    } else if (this.currentFilter === 'pending') {
      habits = habits.filter(h => !h.completions[today]);
    }

    // Sort
    habits.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'streak':
          return this.habitService.calculateStats(b).currentStreak - this.habitService.calculateStats(a).currentStreak;
        case 'progress':
          return this.habitService.getProgressPercentage(b) - this.habitService.getProgressPercentage(a);
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return habits;
  }

  setFilter(filter: 'all' | 'completed' | 'pending'): void {
    this.currentFilter = filter;
  }

  getFilterButtonClass(filter: string): string {
    const baseClass = 'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ';
    if (this.currentFilter === filter) {
      return baseClass + 'bg-standby-accent-blue text-white';
    }
    return baseClass + 'bg-standby-bg text-standby-text-muted hover:text-standby-text hover:bg-standby-card-hover';
  }

  onSortChange(): void {
    // Sorting is handled reactively through the getter
  }

  onHabitClick(habitId: string): void {
    this.router.navigate(['/habits', habitId]);
  }

  onHabitCompleted(habitId: string): void {
    // Optional: Show toast or feedback
  }
}
