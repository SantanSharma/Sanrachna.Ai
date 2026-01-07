import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoalService } from '../../services';
import { GoalType, GoalDuration } from '../../models';

@Component({
  selector: 'app-goal-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-antigoal-bg flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-medium text-antigoal-text mb-3">Anti-Goal</h1>
          <p class="text-antigoal-text-muted text-sm">
            Set a goal. See how you'll probably fail.
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-8">
          <!-- Goal Statement -->
          <div class="mb-8">
            <label class="block text-antigoal-text-muted text-sm mb-2">
              What do you want to achieve?
            </label>
            <input
              type="text"
              [(ngModel)]="goalStatement"
              placeholder="e.g., Wake up at 5 AM daily"
              class="w-full bg-antigoal-bg border border-antigoal-border rounded-lg px-4 py-3 
                     text-antigoal-text placeholder-antigoal-text-dim
                     focus:outline-none focus:border-antigoal-accent"
            />
          </div>

          <!-- Goal Type -->
          <div class="mb-8">
            <label class="block text-antigoal-text-muted text-sm mb-3">
              Goal type
            </label>
            <div class="grid grid-cols-2 gap-3">
              @for (type of goalTypes; track type.value) {
                <button
                  (click)="selectedType = type.value"
                  [class]="selectedType === type.value 
                    ? 'bg-antigoal-neutral border-antigoal-accent text-antigoal-text' 
                    : 'bg-antigoal-bg border-antigoal-border text-antigoal-text-muted hover:border-antigoal-accent'"
                  class="border rounded-lg px-4 py-3 text-sm text-left transition-colors"
                >
                  {{ type.label }}
                </button>
              }
            </div>
          </div>

          <!-- Duration -->
          <div class="mb-10">
            <label class="block text-antigoal-text-muted text-sm mb-3">
              Duration
            </label>
            <div class="flex gap-3">
              @for (duration of durations; track duration) {
                <button
                  (click)="selectedDuration = duration"
                  [class]="selectedDuration === duration 
                    ? 'bg-antigoal-neutral border-antigoal-accent text-antigoal-text' 
                    : 'bg-antigoal-bg border-antigoal-border text-antigoal-text-muted hover:border-antigoal-accent'"
                  class="flex-1 border rounded-lg px-4 py-3 text-sm transition-colors"
                >
                  {{ duration }} days
                </button>
              }
            </div>
          </div>

          <!-- Submit -->
          <button
            (click)="createGoal()"
            [disabled]="!isFormValid()"
            [class]="isFormValid() 
              ? 'bg-antigoal-neutral hover:bg-antigoal-card-hover text-antigoal-text' 
              : 'bg-antigoal-bg text-antigoal-text-dim cursor-not-allowed'"
            class="w-full border border-antigoal-border rounded-lg px-4 py-3 
                   text-sm font-medium transition-colors"
          >
            Begin Tracking Failure
          </button>
        </div>

        <!-- Warning -->
        <p class="text-center text-antigoal-text-dim text-xs mt-6">
          This app will not motivate you. It will show you how you fail.
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class GoalSetupComponent {
  private router = inject(Router);
  private goalService = inject(GoalService);

  goalStatement = '';
  selectedType: GoalType = 'habit';
  selectedDuration: GoalDuration = 14;

  goalTypes: { value: GoalType; label: string }[] = [
    { value: 'health', label: 'Health' },
    { value: 'study', label: 'Study' },
    { value: 'work', label: 'Work' },
    { value: 'habit', label: 'Habit' },
  ];

  durations: GoalDuration[] = [7, 14, 30];

  isFormValid(): boolean {
    return this.goalStatement.trim().length > 0;
  }

  createGoal(): void {
    if (!this.isFormValid()) return;

    this.goalService.createGoal(
      this.goalStatement.trim(),
      this.selectedType,
      this.selectedDuration
    );

    this.router.navigate(['/dashboard']);
  }
}
