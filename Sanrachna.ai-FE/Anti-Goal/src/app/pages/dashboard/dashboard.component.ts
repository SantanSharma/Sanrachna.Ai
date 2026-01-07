import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GoalService } from '../../services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-antigoal-bg">

      <main class="max-w-3xl mx-auto px-4 py-8">
        @if (goalService.goal(); as goal) {
          <!-- Day Counter -->
          <div class="text-center mb-8">
            <span class="text-antigoal-text-muted text-sm">Day</span>
            <span class="text-4xl font-medium text-antigoal-text mx-2">
              {{ goalService.currentDayNumber() }}
            </span>
            <span class="text-antigoal-text-muted text-sm">of {{ goal.duration }}</span>
          </div>

          <!-- Goal Statement -->
          <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mb-6">
            <p class="text-antigoal-text-muted text-xs uppercase tracking-wide mb-2">Your Goal</p>
            <p class="text-antigoal-text text-lg">{{ goal.statement }}</p>
          </div>

          <!-- Warning Banner -->
          @if (goalService.failureStats().totalSkips >= 1) {
            <div class="bg-antigoal-warning-bg border border-antigoal-warning-muted rounded-xl p-4 mb-6">
              <p class="text-antigoal-warning text-sm">
                @if (goalService.failureStats().skipsUntilQuit === 0) {
                  You are following the failure path exactly as predicted.
                } @else if (goalService.failureStats().predictedQuitDay) {
                  You are currently following the failure path. 
                  Most users quit after {{ goalService.failureStats().skipsUntilQuit }} more skip(s).
                } @else {
                  You have started deviating from your goal.
                }
              </p>
            </div>
          }

          <!-- Today's Action -->
          @if (!goalService.todayAction()) {
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mb-6">
              <p class="text-antigoal-text-muted text-sm mb-4">
                Did you act toward your goal today?
              </p>
              <div class="flex gap-3">
                <button
                  (click)="recordYes()"
                  class="flex-1 bg-antigoal-bg border border-antigoal-border rounded-lg py-3 
                         text-antigoal-done text-sm hover:border-antigoal-done transition-colors"
                >
                  ✓ Yes
                </button>
                <button
                  (click)="showExcuseForm.set(true)"
                  class="flex-1 bg-antigoal-bg border border-antigoal-border rounded-lg py-3 
                         text-antigoal-skip text-sm hover:border-antigoal-skip transition-colors"
                >
                  ✗ No
                </button>
              </div>
            </div>
          } @else {
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mb-6">
              <p class="text-antigoal-text-muted text-sm mb-2">Today's record</p>
              @if (goalService.todayAction()?.didAct) {
                <p class="text-antigoal-done text-sm">You acted toward your goal.</p>
              } @else {
                <p class="text-antigoal-skip text-sm">
                  Skipped. Excuse: "{{ goalService.todayAction()?.excuseText }}"
                </p>
              }
            </div>
          }

          <!-- Excuse Form Modal -->
          @if (showExcuseForm()) {
            <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
              <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 w-full max-w-md">
                <h3 class="text-antigoal-text text-lg mb-4">What's your excuse?</h3>
                
                <div class="space-y-2 mb-4">
                  @for (excuse of goalService.predefinedExcuses; track excuse.id) {
                    <button
                      (click)="selectExcuse(excuse.id, excuse.label)"
                      [class]="selectedExcuseId() === excuse.id 
                        ? 'border-antigoal-accent bg-antigoal-neutral' 
                        : 'border-antigoal-border'"
                      class="w-full border rounded-lg px-4 py-3 text-left text-sm 
                             text-antigoal-text-muted hover:border-antigoal-accent transition-colors"
                    >
                      <span>{{ excuse.label }}</span>
                      @if (goalService.getExcuseCount(excuse.id) > 0) {
                        <span class="text-antigoal-warning ml-2">
                          (used {{ goalService.getExcuseCount(excuse.id) }}×)
                        </span>
                      }
                    </button>
                  }
                </div>

                @if (selectedExcuseId() === 'other') {
                  <input
                    type="text"
                    [(ngModel)]="customExcuse"
                    placeholder="Enter your excuse"
                    class="w-full bg-antigoal-bg border border-antigoal-border rounded-lg px-4 py-3 
                           text-antigoal-text placeholder-antigoal-text-dim mb-4
                           focus:outline-none focus:border-antigoal-accent"
                  />
                }

                <div class="flex gap-3">
                  <button
                    (click)="cancelExcuse()"
                    class="flex-1 border border-antigoal-border rounded-lg py-3 
                           text-antigoal-text-muted text-sm hover:border-antigoal-accent"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="submitExcuse()"
                    [disabled]="!canSubmitExcuse()"
                    [class]="canSubmitExcuse() 
                      ? 'bg-antigoal-neutral text-antigoal-text hover:bg-antigoal-card-hover' 
                      : 'bg-antigoal-bg text-antigoal-text-dim cursor-not-allowed'"
                    class="flex-1 border border-antigoal-border rounded-lg py-3 text-sm"
                  >
                    Record Skip
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Failure Path Section -->
          <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mb-6">
            <h2 class="text-antigoal-text-muted text-xs uppercase tracking-wide mb-4">
              Most Likely Failure Path
            </h2>
            <div class="space-y-3">
              @for (pattern of goalService.currentFailurePatterns(); track pattern.dayNumber) {
                <div class="flex items-start gap-3">
                  <span 
                    [class]="pattern.isTriggered ? 'text-antigoal-warning' : 'text-antigoal-text-dim'"
                    class="text-xs w-12 shrink-0"
                  >
                    Day {{ pattern.dayNumber }}
                  </span>
                  <span 
                    [class]="pattern.isTriggered ? 'text-antigoal-warning' : 'text-antigoal-text-muted'"
                    class="text-sm"
                  >
                    {{ pattern.prediction }}
                    @if (pattern.isTriggered) {
                      <span class="text-antigoal-warning ml-1">✓</span>
                    }
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Don't Do This Section -->
          <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mb-6">
            <h2 class="text-antigoal-text-muted text-xs uppercase tracking-wide mb-4">
              Don't Do This
            </h2>
            <ul class="space-y-2">
              @for (item of getDontDoList(); track item) {
                <li class="text-antigoal-text-muted text-sm flex items-start gap-2">
                  <span class="text-antigoal-warning">•</span>
                  <span>{{ item }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- Stats -->
          @if (goalService.failureStats().totalSkips > 0 || goalService.failureStats().totalDone > 0) {
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-4">
                <p class="text-antigoal-text-dim text-xs uppercase mb-1">Skipped</p>
                <p class="text-antigoal-skip text-2xl">{{ goalService.failureStats().totalSkips }}</p>
              </div>
              <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-4">
                <p class="text-antigoal-text-dim text-xs uppercase mb-1">Acted</p>
                <p class="text-antigoal-done text-2xl">{{ goalService.failureStats().totalDone }}</p>
              </div>
            </div>
          }

          @if (goalService.failureStats().mostUsedExcuse) {
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-4 mt-4">
              <p class="text-antigoal-text-dim text-xs uppercase mb-1">Most Used Excuse</p>
              <p class="text-antigoal-warning text-sm">
                "{{ goalService.failureStats().mostUsedExcuse }}" 
                <span class="text-antigoal-text-dim">
                  ({{ goalService.failureStats().mostUsedExcuseCount }}×)
                </span>
              </p>
            </div>
          }

          <!-- Reset Goal -->
          <div class="mt-8 text-center">
            <button 
              (click)="resetGoal()" 
              class="text-antigoal-text-dim text-sm hover:text-antigoal-warning transition-colors"
            >
              Reset Goal
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  private router = inject(Router);
  goalService = inject(GoalService);

  showExcuseForm = signal(false);
  selectedExcuseId = signal<string | null>(null);
  customExcuse = '';

  getDontDoList(): string[] {
    const goal = this.goalService.goal();
    if (!goal) return [];
    return this.goalService.dontDoThisList[goal.type];
  }

  recordYes(): void {
    this.goalService.recordAction(true);
  }

  selectExcuse(id: string, label: string): void {
    this.selectedExcuseId.set(id);
    if (id !== 'other') {
      this.customExcuse = label;
    } else {
      this.customExcuse = '';
    }
  }

  canSubmitExcuse(): boolean {
    if (!this.selectedExcuseId()) return false;
    if (this.selectedExcuseId() === 'other' && !this.customExcuse.trim()) return false;
    return true;
  }

  submitExcuse(): void {
    if (!this.canSubmitExcuse()) return;

    const excuseId = this.selectedExcuseId()!;
    const excuseText = excuseId === 'other' 
      ? this.customExcuse.trim() 
      : this.goalService.predefinedExcuses.find(e => e.id === excuseId)?.label || '';

    this.goalService.recordAction(false, excuseId, excuseText);
    this.cancelExcuse();
  }

  cancelExcuse(): void {
    this.showExcuseForm.set(false);
    this.selectedExcuseId.set(null);
    this.customExcuse = '';
  }

  resetGoal(): void {
    if (confirm('This will delete all your progress. Continue?')) {
      this.goalService.resetGoal();
      this.router.navigate(['/']);
    }
  }
}
