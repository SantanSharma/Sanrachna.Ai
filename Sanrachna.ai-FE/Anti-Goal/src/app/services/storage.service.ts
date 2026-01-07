import { Injectable } from '@angular/core';

const STORAGE_KEYS = {
  GOAL: 'antigoal_goal',
  DAILY_ACTIONS: 'antigoal_daily_actions',
  EXCUSE_LOGS: 'antigoal_excuse_logs',
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
  }

  get keys() {
    return STORAGE_KEYS;
  }
}
