import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoalService } from '../../services';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-antigoal-bg">

      <main class="max-w-3xl mx-auto px-4 py-8">
        @if (goalService.goal(); as goal) {
          <!-- Goal Statement -->
          <div class="text-center mb-8">
            <p class="text-antigoal-text-muted text-sm mb-1">Goal</p>
            <p class="text-antigoal-text">{{ goal.statement }}</p>
          </div>

          <!-- Summary Stats -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-4 text-center">
              <p class="text-antigoal-text-dim text-xs uppercase mb-1">Days</p>
              <p class="text-antigoal-text text-xl">
                {{ goalService.currentDayNumber() }}/{{ goal.duration }}
              </p>
            </div>
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-4 text-center">
              <p class="text-antigoal-text-dim text-xs uppercase mb-1">Acted</p>
              <p class="text-antigoal-done text-xl">{{ goalService.failureStats().totalDone }}</p>
            </div>
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-4 text-center">
              <p class="text-antigoal-text-dim text-xs uppercase mb-1">Skipped</p>
              <p class="text-antigoal-skip text-xl">{{ goalService.failureStats().totalSkips }}</p>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6">
            <h2 class="text-antigoal-text-muted text-xs uppercase tracking-wide mb-6">
              Chronological Record
            </h2>

            @if (getTimelineEntries().length === 0) {
              <p class="text-antigoal-text-dim text-sm text-center py-8">
                No entries yet. Start tracking today.
              </p>
            } @else {
              <div class="space-y-4">
                @for (entry of getTimelineEntries(); track entry.dayNumber) {
                  <div class="border-l-2 pl-4 py-2"
                       [class]="entry.didAct === true 
                         ? 'border-antigoal-done' 
                         : entry.didAct === false 
                           ? 'border-antigoal-skip' 
                           : 'border-antigoal-border'">
                    
                    <!-- Day Header -->
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-antigoal-text-muted text-sm">Day {{ entry.dayNumber }}</span>
                      <span class="text-antigoal-text-dim text-xs">{{ formatDate(entry.date) }}</span>
                    </div>

                    <!-- Planned Action -->
                    <p class="text-antigoal-text-dim text-xs mb-1">
                      Planned: {{ goal.statement }}
                    </p>

                    <!-- Actual Action -->
                    @if (entry.didAct === true) {
                      <p class="text-antigoal-done text-sm">Actual: Completed</p>
                    } @else if (entry.didAct === false) {
                      <p class="text-antigoal-skip text-sm">Actual: Skipped</p>
                      @if (entry.excuseText) {
                        <p class="text-antigoal-warning text-sm mt-1">
                          Excuse: "{{ entry.excuseText }}"
                          @if (getExcuseUsageCount(entry.excuseId) > 1) {
                            <span class="text-antigoal-text-dim">
                              (used {{ getExcuseUsageCount(entry.excuseId) }} times before)
                            </span>
                          }
                        </p>
                      }
                    } @else {
                      <p class="text-antigoal-text-dim text-sm">Actual: Not recorded</p>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Pattern Analysis -->
          @if (goalService.failureStats().mostUsedExcuse) {
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mt-6">
              <h2 class="text-antigoal-text-muted text-xs uppercase tracking-wide mb-4">
                Pattern Analysis
              </h2>
              
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-antigoal-text-dim text-sm">Most used excuse</span>
                  <span class="text-antigoal-warning text-sm">
                    "{{ goalService.failureStats().mostUsedExcuse }}"
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-antigoal-text-dim text-sm">Times used</span>
                  <span class="text-antigoal-text-muted text-sm">
                    {{ goalService.failureStats().mostUsedExcuseCount }}
                  </span>
                </div>

                @if (goalService.failureStats().currentStreak > 0) {
                  <div class="flex justify-between items-center">
                    <span class="text-antigoal-text-dim text-sm">Current skip streak</span>
                    <span class="text-antigoal-skip text-sm">
                      {{ goalService.failureStats().currentStreak }} day(s)
                    </span>
                  </div>
                }

                @if (goalService.failureStats().predictedQuitDay) {
                  <div class="border-t border-antigoal-border pt-3 mt-3">
                    <p class="text-antigoal-warning text-sm">
                      Based on your pattern, you may quit by Day {{ goalService.failureStats().predictedQuitDay }}.
                    </p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Excuse Usage Summary -->
          @if (getExcuseSummary().length > 0) {
            <div class="bg-antigoal-card border border-antigoal-border rounded-xl p-6 mt-6">
              <h2 class="text-antigoal-text-muted text-xs uppercase tracking-wide mb-4">
                Excuse Usage
              </h2>
              <div class="space-y-2">
                @for (excuse of getExcuseSummary(); track excuse.id) {
                  <div class="flex justify-between items-center">
                    <span class="text-antigoal-text-muted text-sm">"{{ excuse.text }}"</span>
                    <span class="text-antigoal-text-dim text-sm">{{ excuse.count }}×</span>
                  </div>
                }
              </div>
            </div>
          }
        } @else {
          <div class="text-center py-12">
            <p class="text-antigoal-text-muted mb-4">No goal set.</p>
            <a routerLink="/" class="text-antigoal-accent hover:text-antigoal-text">
              Set up a goal
            </a>
          </div>
        }
      </main>
    </div>
  `,
  styles: []
})
export class TimelineComponent {
  goalService = inject(GoalService);

  getTimelineEntries() {
    const goal = this.goalService.goal();
    if (!goal) return [];

    const actions = this.goalService.dailyActions();
    const currentDay = this.goalService.currentDayNumber();
    const entries = [];

    for (let day = 1; day <= currentDay; day++) {
      const action = actions.find(a => a.dayNumber === day);
      entries.push({
        dayNumber: day,
        date: action?.date || this.calculateDateForDay(day),
        didAct: action?.didAct ?? null,
        excuseId: action?.excuseId || null,
        excuseText: action?.excuseText || null,
      });
    }

    return entries.reverse(); // Most recent first
  }

  calculateDateForDay(dayNumber: number): string {
    const goal = this.goalService.goal();
    if (!goal) return '';

    const startDate = new Date(goal.startDate);
    startDate.setDate(startDate.getDate() + dayNumber - 1);
    return startDate.toISOString();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getExcuseUsageCount(excuseId: string | null): number {
    if (!excuseId) return 0;
    return this.goalService.getExcuseCount(excuseId);
  }

  getExcuseSummary() {
    const excuseLogs = this.goalService.excuseLogs();
    return excuseLogs
      .map(log => ({
        id: log.excuseId,
        text: log.excuseText,
        count: log.count,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
