export type GoalType = 'health' | 'study' | 'work' | 'habit';
export type GoalDuration = 7 | 14 | 30;

export interface Goal {
  id: string;
  statement: string;
  type: GoalType;
  duration: GoalDuration;
  startDate: string;
  createdAt: string;
  isActive: boolean;
}

export interface FailurePattern {
  dayNumber: number;
  prediction: string;
  isTriggered: boolean;
}

export interface DailyAction {
  id: string;
  goalId: string;
  dayNumber: number;
  date: string;
  didAct: boolean | null;
  excuseId: string | null;
  excuseText: string | null;
  createdAt: string;
}

export interface ExcuseLog {
  id: string;
  goalId: string;
  excuseId: string;
  excuseText: string;
  count: number;
  lastUsed: string;
}

export interface PredefinedExcuse {
  id: string;
  label: string;
}

export interface FailureStats {
  totalSkips: number;
  totalDone: number;
  currentStreak: number;
  mostUsedExcuse: string | null;
  mostUsedExcuseCount: number;
  predictedQuitDay: number | null;
  skipsUntilQuit: number;
}
