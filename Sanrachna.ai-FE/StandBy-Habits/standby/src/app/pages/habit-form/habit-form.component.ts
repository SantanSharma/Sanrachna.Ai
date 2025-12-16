import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { Habit, HABIT_COLORS, EFFORT_LEVELS, HabitColor, EffortLevel } from '../../models/habit.model';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="habit-form-page min-h-screen bg-standby-bg">
      <div class="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <a
            routerLink="/habits"
            class="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-standby-text-muted hover:text-standby-text transition-colors mb-3 sm:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </a>
          <h1 class="text-2xl sm:text-3xl font-bold text-standby-text">
            {{ isEditMode ? 'Edit Habit' : 'New Habit' }}
          </h1>
          <p class="text-standby-text-muted mt-0.5 sm:mt-1 text-sm sm:text-base">
            {{ isEditMode ? 'Update your habit details' : 'Start building a new positive habit' }}
          </p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4 sm:space-y-6">

          <!-- Title -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border">
            <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
              Habit Title <span class="text-standby-accent-red">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="habitForm.title"
              name="title"
              placeholder="e.g., Morning Meditation"
              class="w-full bg-standby-bg border border-standby-border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-standby-text placeholder-standby-text-muted focus:outline-none focus:border-standby-accent-blue transition-colors"
              required>
          </div>

          <!-- Description -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border">
            <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
              Description <span class="text-standby-text-muted">(optional)</span>
            </label>
            <textarea
              [(ngModel)]="habitForm.description"
              name="description"
              placeholder="Why is this habit important to you?"
              rows="3"
              class="w-full bg-standby-bg border border-standby-border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-standby-text placeholder-standby-text-muted focus:outline-none focus:border-standby-accent-blue transition-colors resize-none">
            </textarea>
          </div>

          <!-- Dates -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border">
            <h3 class="text-base sm:text-lg font-medium text-standby-text mb-3 sm:mb-4">Duration</h3>
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
                  Start <span class="text-standby-accent-red">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="habitForm.startDate"
                  name="startDate"
                  class="w-full bg-standby-bg border border-standby-border rounded-lg sm:rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-base text-standby-text focus:outline-none focus:border-standby-accent-blue transition-colors"
                  required>
              </div>
              <div>
                <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
                  End <span class="text-standby-accent-red">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="habitForm.endDate"
                  name="endDate"
                  [min]="habitForm.startDate"
                  class="w-full bg-standby-bg border border-standby-border rounded-lg sm:rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-base text-standby-text focus:outline-none focus:border-standby-accent-blue transition-colors"
                  required>
              </div>
            </div>
            <p class="text-xs sm:text-sm text-standby-text-muted mt-2 sm:mt-3">
              Duration: {{ calculateDuration() }} days
            </p>
          </div>

          <!-- Time & Effort -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border">
            <h3 class="text-base sm:text-lg font-medium text-standby-text mb-3 sm:mb-4">Commitment</h3>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
                  Daily Time (mins) <span class="text-standby-accent-red">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="habitForm.dailyMinutes"
                  name="dailyMinutes"
                  min="1"
                  max="480"
                  placeholder="20"
                  class="w-full bg-standby-bg border border-standby-border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-standby-text focus:outline-none focus:border-standby-accent-blue transition-colors"
                  required>
              </div>
              <div>
                <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
                  Effort Level <span class="text-standby-accent-red">*</span>
                </label>
                <div class="flex gap-2">
                  @for (level of effortLevels; track level.value) {
                    <button
                      type="button"
                      (click)="habitForm.effortLevel = level.value"
                      [class]="getEffortButtonClass(level.value)">
                      {{ level.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Color & Reminder -->
          <div class="bg-standby-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-standby-border">
            <h3 class="text-base sm:text-lg font-medium text-standby-text mb-3 sm:mb-4">Personalization</h3>

            <div class="mb-4 sm:mb-6">
              <label class="block text-xs sm:text-sm font-medium text-standby-text mb-2 sm:mb-3">
                Color Tag
              </label>
              <div class="flex gap-2 sm:gap-3 flex-wrap">
                @for (color of habitColors; track color.value) {
                  <button
                    type="button"
                    (click)="habitForm.color = color.value"
                    [class]="getColorButtonClass(color)"
                    [title]="color.label">
                    @if (habitForm.color === color.value) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    }
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium text-standby-text mb-1.5 sm:mb-2">
                Reminder Time <span class="text-standby-text-muted">(optional)</span>
              </label>
              <input
                type="time"
                [(ngModel)]="habitForm.reminderTime"
                name="reminderTime"
                class="w-full bg-standby-bg border border-standby-border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-standby-text focus:outline-none focus:border-standby-accent-blue transition-colors">
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 sm:pt-4">
            @if (isEditMode) {
              <button
                type="button"
                (click)="onDelete()"
                class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-standby-accent-red/20 text-standby-accent-red hover:bg-standby-accent-red/30 transition-colors text-sm sm:text-base text-center">
                Delete Habit
              </button>
            } @else {
              <div class="hidden sm:block"></div>
            }

            <div class="flex gap-2 sm:gap-3">
              <a
                routerLink="/habits"
                class="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-standby-card-hover text-standby-text hover:bg-standby-border transition-colors text-sm sm:text-base text-center">
                Cancel
              </a>
              <button
                type="submit"
                [disabled]="!isFormValid()"
                class="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-standby-accent-blue text-white hover:bg-standby-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base">
                {{ isEditMode ? 'Save' : 'Create' }}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  `,
  styles: [`
    .habit-form-page {
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

    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      filter: invert(0.7);
    }
  `]
})
export class HabitFormComponent implements OnInit {
  private habitService = inject(HabitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  habitColors = HABIT_COLORS;
  effortLevels = EFFORT_LEVELS;

  isEditMode = false;
  editingHabitId: string | null = null;

  habitForm = {
    title: '',
    description: '',
    startDate: this.getTodayDate(),
    endDate: this.getDefaultEndDate(),
    dailyMinutes: 20,
    effortLevel: 'Medium' as EffortLevel,
    color: 'green' as HabitColor,
    reminderTime: '',
  };

  ngOnInit(): void {
    const habitId = this.route.snapshot.paramMap.get('id');
    if (habitId && habitId !== 'new') {
      const habit = this.habitService.getHabitById(habitId);
      if (habit) {
        this.isEditMode = true;
        this.editingHabitId = habitId;
        this.habitForm = {
          title: habit.title,
          description: habit.description || '',
          startDate: habit.startDate,
          endDate: habit.endDate,
          dailyMinutes: habit.dailyMinutes,
          effortLevel: habit.effortLevel,
          color: habit.color as HabitColor,
          reminderTime: habit.reminderTime || '',
        };
      }
    }
  }

  /**
   * Gets today's date in local timezone as YYYY-MM-DD
   */
  getTodayDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets default end date (30 days from today) in local timezone
   */
  getDefaultEndDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calculateDuration(): number {
    if (!this.habitForm.startDate || !this.habitForm.endDate) return 0;
    const start = new Date(this.habitForm.startDate);
    const end = new Date(this.habitForm.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  getEffortButtonClass(level: EffortLevel): string {
    const baseClass = 'flex-1 px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ';
    if (this.habitForm.effortLevel === level) {
      switch (level) {
        case 'Low':
          return baseClass + 'bg-standby-accent-green text-white';
        case 'Medium':
          return baseClass + 'bg-standby-accent-yellow text-standby-bg';
        case 'High':
          return baseClass + 'bg-standby-accent-orange text-white';
      }
    }
    return baseClass + 'bg-standby-bg text-standby-text-muted hover:bg-standby-card-hover';
  }

  getColorButtonClass(color: { value: HabitColor; label: string; class: string }): string {
    const baseClass = `w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 ${color.class} `;
    if (this.habitForm.color === color.value) {
      return baseClass + 'ring-2 ring-offset-2 ring-offset-standby-card ring-white';
    }
    return baseClass + 'opacity-60 hover:opacity-100';
  }

  isFormValid(): boolean {
    return !!(
      this.habitForm.title.trim() &&
      this.habitForm.startDate &&
      this.habitForm.endDate &&
      this.habitForm.dailyMinutes > 0 &&
      this.habitForm.effortLevel &&
      this.calculateDuration() > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const habitData = {
      title: this.habitForm.title.trim(),
      description: this.habitForm.description.trim() || undefined,
      startDate: this.habitForm.startDate,
      endDate: this.habitForm.endDate,
      dailyMinutes: this.habitForm.dailyMinutes,
      effortLevel: this.habitForm.effortLevel,
      color: this.habitForm.color,
      reminderTime: this.habitForm.reminderTime || undefined,
    };

    if (this.isEditMode && this.editingHabitId) {
      this.habitService.updateHabit(this.editingHabitId, habitData);
    } else {
      this.habitService.createHabit(habitData);
    }

    this.router.navigate(['/habits']);
  }

  onDelete(): void {
    if (this.editingHabitId) {
      this.habitService.deleteHabit(this.editingHabitId);
      this.router.navigate(['/habits']);
    }
  }
}
