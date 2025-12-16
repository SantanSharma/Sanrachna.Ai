import { Injectable, signal, computed } from '@angular/core';
import { Habit, HabitStats, MOTIVATIONAL_QUOTES } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STORAGE_KEY = 'standby_habits';

  private habitsSignal = signal<Habit[]>(this.loadFromStorage());

  readonly habits = this.habitsSignal.asReadonly();

  readonly totalHabits = computed(() => this.habitsSignal().length);

  readonly habitsCompletedToday = computed(() => {
    const today = this.formatDate(new Date());
    return this.habitsSignal().filter(h => h.completions[today]).length;
  });

  readonly totalCurrentStreak = computed(() => {
    const habits = this.habitsSignal();
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => this.calculateStats(h).currentStreak));
  });

  constructor() {}

  private loadFromStorage(): Habit[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.habitsSignal()));
  }

  private generateId(): string {
    return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formats a date to YYYY-MM-DD string using LOCAL timezone (not UTC)
   * This ensures the date matches the user's actual day in their timezone
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parses a date string and creates a Date object in local timezone
   */
  parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  createHabit(habitData: Omit<Habit, 'id' | 'completions' | 'createdAt' | 'updatedAt'>): Habit {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habitData,
      id: this.generateId(),
      completions: {},
      createdAt: now,
      updatedAt: now,
    };

    this.habitsSignal.update(habits => [...habits, newHabit]);
    this.saveToStorage();
    return newHabit;
  }

  updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Habit | null {
    let updatedHabit: Habit | null = null;

    this.habitsSignal.update(habits =>
      habits.map(h => {
        if (h.id === id) {
          updatedHabit = { ...h, ...updates, updatedAt: new Date().toISOString() };
          return updatedHabit;
        }
        return h;
      })
    );

    this.saveToStorage();
    return updatedHabit;
  }

  deleteHabit(id: string): void {
    this.habitsSignal.update(habits => habits.filter(h => h.id !== id));
    this.saveToStorage();
  }

  getHabitById(id: string): Habit | undefined {
    return this.habitsSignal().find(h => h.id === id);
  }

  toggleCompletion(habitId: string, date: string): void {
    this.habitsSignal.update(habits =>
      habits.map(h => {
        if (h.id === habitId) {
          const newCompletions = { ...h.completions };
          if (newCompletions[date]) {
            delete newCompletions[date];
          } else {
            newCompletions[date] = true;
          }
          return { ...h, completions: newCompletions, updatedAt: new Date().toISOString() };
        }
        return h;
      })
    );
    this.saveToStorage();
  }

  markTodayCompleted(habitId: string): void {
    const today = this.formatDate(new Date());
    this.habitsSignal.update(habits =>
      habits.map(h => {
        if (h.id === habitId && !h.completions[today]) {
          return {
            ...h,
            completions: { ...h.completions, [today]: true },
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      })
    );
    this.saveToStorage();
  }

  isCompletedToday(habitId: string): boolean {
    const today = this.formatDate(new Date());
    const habit = this.getHabitById(habitId);
    return habit ? !!habit.completions[today] : false;
  }

  calculateStats(habit: Habit): HabitStats {
    const startDate = this.parseDate(habit.startDate);
    const endDate = this.parseDate(habit.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const effectiveEndDate = endDate < today ? endDate : today;

    let totalDays = 0;
    let completedDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= effectiveEndDate) {
      totalDays++;
      const dateStr = this.formatDate(currentDate);

      if (habit.completions[dateStr]) {
        completedDays++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate current streak (consecutive days ending today or yesterday)
    currentStreak = 0;
    const checkDate = new Date(today);

    // Check if today is completed, if not start from yesterday
    const todayStr = this.formatDate(today);
    if (!habit.completions[todayStr]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (checkDate >= startDate) {
      const dateStr = this.formatDate(checkDate);
      if (habit.completions[dateStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    return {
      totalDays,
      completedDays,
      currentStreak,
      longestStreak,
      completionRate,
    };
  }

  getProgressPercentage(habit: Habit): number {
    const stats = this.calculateStats(habit);
    return Math.round(stats.completionRate);
  }

  getDailyMotivation(): string {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }

  getCompletionGridData(habit: Habit, weeks: number = 12): { date: string; completed: boolean; isToday: boolean; isFuture: boolean }[] {
    const grid: { date: string; completed: boolean; isToday: boolean; isFuture: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.formatDate(today);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1));

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = this.formatDate(currentDate);
      grid.push({
        date: dateStr,
        completed: !!habit.completions[dateStr],
        isToday: dateStr === todayStr,
        isFuture: currentDate > today,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return grid;
  }

  getGlobalCompletionGrid(weeks: number = 12): { date: string; count: number; isToday: boolean }[] {
    const grid: { date: string; count: number; isToday: boolean }[] = [];
    const habits = this.habitsSignal();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.formatDate(today);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1));

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = this.formatDate(currentDate);
      const count = habits.filter(h => h.completions[dateStr]).length;
      grid.push({
        date: dateStr,
        count,
        isToday: dateStr === todayStr,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return grid;
  }

  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      green: 'bg-standby-accent-green',
      blue: 'bg-standby-accent-blue',
      orange: 'bg-standby-accent-orange',
      yellow: 'bg-standby-accent-yellow',
      teal: 'bg-standby-accent-teal',
    };
    return colorMap[color] || 'bg-standby-accent-green';
  }
}
