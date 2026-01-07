import { Injectable, signal, computed } from '@angular/core';
import { 
  Goal, 
  GoalType, 
  GoalDuration, 
  FailurePattern, 
  DailyAction, 
  ExcuseLog, 
  PredefinedExcuse,
  FailureStats 
} from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  
  private readonly _goal = signal<Goal | null>(null);
  private readonly _dailyActions = signal<DailyAction[]>([]);
  private readonly _excuseLogs = signal<ExcuseLog[]>([]);

  readonly goal = this._goal.asReadonly();
  readonly dailyActions = this._dailyActions.asReadonly();
  readonly excuseLogs = this._excuseLogs.asReadonly();

  readonly predefinedExcuses: PredefinedExcuse[] = [
    { id: 'tired', label: 'Too tired' },
    { id: 'busy', label: 'Too busy' },
    { id: 'tomorrow', label: 'Will do tomorrow' },
    { id: 'forgot', label: 'Forgot about it' },
    { id: 'not-feeling', label: 'Not feeling like it' },
    { id: 'weekend', label: 'It\'s the weekend' },
    { id: 'stressed', label: 'Too stressed' },
    { id: 'other', label: 'Other' },
  ];

  readonly failurePatterns: Record<GoalType, FailurePattern[]> = {
    health: [
      { dayNumber: 2, prediction: 'Initial enthusiasm starts to fade', isTriggered: false },
      { dayNumber: 4, prediction: '"I deserve a break" thought appears', isTriggered: false },
      { dayNumber: 7, prediction: '"One skip won\'t hurt" justification', isTriggered: false },
      { dayNumber: 10, prediction: 'Skip becomes the new default', isTriggered: false },
      { dayNumber: 14, prediction: 'Goal quietly forgotten', isTriggered: false },
    ],
    study: [
      { dayNumber: 2, prediction: 'Distractions feel more appealing', isTriggered: false },
      { dayNumber: 5, prediction: '"I\'ll study double tomorrow"', isTriggered: false },
      { dayNumber: 8, prediction: 'Social media replaces study time', isTriggered: false },
      { dayNumber: 12, prediction: 'Cramming becomes the strategy', isTriggered: false },
      { dayNumber: 15, prediction: 'Goal abandoned mid-way', isTriggered: false },
    ],
    work: [
      { dayNumber: 3, prediction: 'Urgent tasks take priority', isTriggered: false },
      { dayNumber: 5, prediction: '"Too busy" becomes the excuse', isTriggered: false },
      { dayNumber: 8, prediction: 'Important but not urgent gets postponed', isTriggered: false },
      { dayNumber: 12, prediction: 'Goal feels like extra burden', isTriggered: false },
      { dayNumber: 18, prediction: 'Completely forgotten in daily chaos', isTriggered: false },
    ],
    habit: [
      { dayNumber: 3, prediction: 'Motivation drops significantly', isTriggered: false },
      { dayNumber: 5, prediction: '"I\'ll skip just today"', isTriggered: false },
      { dayNumber: 7, prediction: 'One skip leads to another', isTriggered: false },
      { dayNumber: 10, prediction: 'Old habits reclaim the space', isTriggered: false },
      { dayNumber: 14, prediction: 'Goal silently abandoned', isTriggered: false },
    ],
  };

  readonly dontDoThisList: Record<GoalType, string[]> = {
    health: [
      "Don't skip 'just one day'",
      "Don't replace effort with scrolling",
      "Don't wait until you 'feel like it'",
      "Don't negotiate with your future self",
      "Don't use tiredness as a permanent excuse",
    ],
    study: [
      "Don't open social media 'for just a minute'",
      "Don't study 'when you feel ready'",
      "Don't promise to 'study double tomorrow'",
      "Don't mistake reading summaries for deep study",
      "Don't let notifications interrupt focus",
    ],
    work: [
      "Don't prioritize urgent over important",
      "Don't check email first thing",
      "Don't confuse being busy with being productive",
      "Don't let meetings eat your deep work time",
      "Don't postpone the uncomfortable tasks",
    ],
    habit: [
      "Don't break the chain 'just once'",
      "Don't rely on motivation",
      "Don't make exceptions for special days",
      "Don't negotiate the minimum",
      "Don't wait for the perfect moment",
    ],
  };

  readonly currentDayNumber = computed(() => {
    const goal = this._goal();
    if (!goal) return 0;
    
    const start = new Date(goal.startDate);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.min(Math.max(diffDays, 1), goal.duration);
  });

  readonly todayAction = computed(() => {
    const dayNum = this.currentDayNumber();
    const goalId = this._goal()?.id;
    if (!goalId) return null;
    
    return this._dailyActions().find(
      a => a.goalId === goalId && a.dayNumber === dayNum
    ) || null;
  });

  readonly failureStats = computed<FailureStats>(() => {
    const actions = this._dailyActions();
    const excuses = this._excuseLogs();
    
    const totalSkips = actions.filter(a => a.didAct === false).length;
    const totalDone = actions.filter(a => a.didAct === true).length;
    
    // Calculate current streak (consecutive skips)
    let currentStreak = 0;
    const sortedActions = [...actions].sort((a, b) => b.dayNumber - a.dayNumber);
    for (const action of sortedActions) {
      if (action.didAct === false) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Find most used excuse
    let mostUsedExcuse: string | null = null;
    let mostUsedExcuseCount = 0;
    for (const excuse of excuses) {
      if (excuse.count > mostUsedExcuseCount) {
        mostUsedExcuseCount = excuse.count;
        mostUsedExcuse = excuse.excuseText;
      }
    }
    
    // Predict quit day based on patterns
    const skipsUntilQuit = Math.max(0, 3 - currentStreak);
    const predictedQuitDay = skipsUntilQuit === 0 
      ? this.currentDayNumber() 
      : this.currentDayNumber() + skipsUntilQuit;
    
    return {
      totalSkips,
      totalDone,
      currentStreak,
      mostUsedExcuse,
      mostUsedExcuseCount,
      predictedQuitDay: totalSkips >= 2 ? predictedQuitDay : null,
      skipsUntilQuit,
    };
  });

  readonly currentFailurePatterns = computed(() => {
    const goal = this._goal();
    if (!goal) return [];
    
    const patterns = [...this.failurePatterns[goal.type]];
    const currentDay = this.currentDayNumber();
    const actions = this._dailyActions();
    
    return patterns.map(p => ({
      ...p,
      isTriggered: p.dayNumber <= currentDay && 
        actions.some(a => a.dayNumber <= p.dayNumber && a.didAct === false),
    }));
  });

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const goal = this.storage.get<Goal>(this.storage.keys.GOAL);
    const actions = this.storage.get<DailyAction[]>(this.storage.keys.DAILY_ACTIONS) || [];
    const excuses = this.storage.get<ExcuseLog[]>(this.storage.keys.EXCUSE_LOGS) || [];
    
    this._goal.set(goal);
    this._dailyActions.set(actions);
    this._excuseLogs.set(excuses);
  }

  private saveGoal(): void {
    const goal = this._goal();
    if (goal) {
      this.storage.set(this.storage.keys.GOAL, goal);
    } else {
      this.storage.remove(this.storage.keys.GOAL);
    }
  }

  private saveActions(): void {
    this.storage.set(this.storage.keys.DAILY_ACTIONS, this._dailyActions());
  }

  private saveExcuses(): void {
    this.storage.set(this.storage.keys.EXCUSE_LOGS, this._excuseLogs());
  }

  createGoal(statement: string, type: GoalType, duration: GoalDuration): Goal {
    const now = new Date().toISOString();
    const goal: Goal = {
      id: crypto.randomUUID(),
      statement,
      type,
      duration,
      startDate: now,
      createdAt: now,
      isActive: true,
    };
    
    this._goal.set(goal);
    this._dailyActions.set([]);
    this._excuseLogs.set([]);
    
    this.saveGoal();
    this.saveActions();
    this.saveExcuses();
    
    return goal;
  }

  recordAction(didAct: boolean, excuseId?: string, excuseText?: string): void {
    const goal = this._goal();
    if (!goal) return;
    
    const dayNumber = this.currentDayNumber();
    const existingAction = this._dailyActions().find(
      a => a.goalId === goal.id && a.dayNumber === dayNumber
    );
    
    const action: DailyAction = {
      id: existingAction?.id || crypto.randomUUID(),
      goalId: goal.id,
      dayNumber,
      date: new Date().toISOString(),
      didAct,
      excuseId: didAct ? null : (excuseId || null),
      excuseText: didAct ? null : (excuseText || null),
      createdAt: existingAction?.createdAt || new Date().toISOString(),
    };
    
    if (existingAction) {
      this._dailyActions.update(actions => 
        actions.map(a => a.id === existingAction.id ? action : a)
      );
    } else {
      this._dailyActions.update(actions => [...actions, action]);
    }
    
    // Update excuse log if skipped
    if (!didAct && excuseId && excuseText) {
      this.logExcuse(goal.id, excuseId, excuseText);
    }
    
    this.saveActions();
  }

  private logExcuse(goalId: string, excuseId: string, excuseText: string): void {
    const existing = this._excuseLogs().find(
      e => e.goalId === goalId && e.excuseId === excuseId
    );
    
    if (existing) {
      this._excuseLogs.update(logs => 
        logs.map(e => e.id === existing.id 
          ? { ...e, count: e.count + 1, lastUsed: new Date().toISOString() }
          : e
        )
      );
    } else {
      const log: ExcuseLog = {
        id: crypto.randomUUID(),
        goalId,
        excuseId,
        excuseText,
        count: 1,
        lastUsed: new Date().toISOString(),
      };
      this._excuseLogs.update(logs => [...logs, log]);
    }
    
    this.saveExcuses();
  }

  getExcuseCount(excuseId: string): number {
    const goal = this._goal();
    if (!goal) return 0;
    
    const log = this._excuseLogs().find(
      e => e.goalId === goal.id && e.excuseId === excuseId
    );
    return log?.count || 0;
  }

  resetGoal(): void {
    this._goal.set(null);
    this._dailyActions.set([]);
    this._excuseLogs.set([]);
    this.storage.clear();
  }

  hasActiveGoal(): boolean {
    return this._goal() !== null && this._goal()!.isActive;
  }
}
