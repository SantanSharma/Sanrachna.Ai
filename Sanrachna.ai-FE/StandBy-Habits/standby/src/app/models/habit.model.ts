export interface Habit {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  dailyMinutes: number;
  effortLevel: 'Low' | 'Medium' | 'High';
  color: 'green' | 'blue' | 'orange' | 'yellow' | 'teal';
  reminderTime?: string;
  completions: {
    [date: string]: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HabitStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export type EffortLevel = 'Low' | 'Medium' | 'High';
export type HabitColor = 'green' | 'blue' | 'orange' | 'yellow' | 'teal';

export const HABIT_COLORS: { value: HabitColor; label: string; class: string }[] = [
  { value: 'green', label: 'Green', class: 'bg-standby-accent-green' },
  { value: 'blue', label: 'Blue', class: 'bg-standby-accent-blue' },
  { value: 'orange', label: 'Orange', class: 'bg-standby-accent-orange' },
  { value: 'yellow', label: 'Yellow', class: 'bg-standby-accent-yellow' },
  { value: 'teal', label: 'Teal', class: 'bg-standby-accent-teal' },
];

export const EFFORT_LEVELS: { value: EffortLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

export const MOTIVATIONAL_QUOTES = [
  "Small steps, every day.",
  "Don't break the chain.",
  "Your future is built today.",
  "Consistency beats intensity.",
  "Show up. That's the win.",
  "Progress, not perfection.",
  "One day at a time.",
  "Build the habit, become the person.",
  "Your discipline is your freedom.",
  "Trust the process.",
  "Every day is a fresh start.",
  "Momentum starts with one step.",
];
