import { Injectable, signal } from '@angular/core';

/**
 * Generic Storage Service for localStorage operations
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = 'viraasat360_';

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get current timestamp
   */
  getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Save data to localStorage
   */
  save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  /**
   * Load data from localStorage
   */
  load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all app data
   */
  clearAll(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }
}
