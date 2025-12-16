import { Injectable, signal, effect } from '@angular/core';
import { ThemeMode } from '../models';

/**
 * Theme Service
 * Handles dark/light mode theming with system preference detection
 * and persistence to localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'lt_theme';
  
  // Reactive state
  private themeModeSignal = signal<ThemeMode>('dark');
  readonly themeMode = this.themeModeSignal.asReadonly();

  constructor() {
    this.initializeTheme();
    
    // Effect to apply theme changes to DOM
    effect(() => {
      this.applyTheme(this.themeModeSignal());
    });
  }

  /**
   * Initialize theme from storage or system preference
   */
  private initializeTheme(): void {
    const stored = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    
    if (stored) {
      this.themeModeSignal.set(stored);
    } else {
      // Default to dark theme for this application
      this.themeModeSignal.set('dark');
    }
  }

  /**
   * Set the theme mode
   */
  setTheme(mode: ThemeMode): void {
    this.themeModeSignal.set(mode);
    localStorage.setItem(this.THEME_KEY, mode);
  }

  /**
   * Toggle between light and dark modes
   */
  toggleTheme(): void {
    const current = this.themeModeSignal();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    const mode = this.themeModeSignal();
    if (mode === 'system') {
      return this.getSystemPreference() === 'dark';
    }
    return mode === 'dark';
  }

  /**
   * Get system color scheme preference
   */
  private getSystemPreference(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    return 'dark';
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const effectiveMode = mode === 'system' 
      ? this.getSystemPreference() 
      : mode;

    const html = document.documentElement;
    
    if (effectiveMode === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }
}
