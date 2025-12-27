import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models';

/**
 * Toast Service
 * Manages toast notifications throughout the application.
 * Uses Angular signals for reactive state management.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private readonly DEFAULT_DURATION = 5000; // 5 seconds
  private idCounter = 0;

  /**
   * Show a success toast
   */
  success(title: string, message?: string, duration?: number): void {
    this.show('success', title, message, duration);
  }

  /**
   * Show an error toast
   */
  error(title: string, message?: string, duration?: number): void {
    this.show('error', title, message, duration);
  }

  /**
   * Show a warning toast
   */
  warning(title: string, message?: string, duration?: number): void {
    this.show('warning', title, message, duration);
  }

  /**
   * Show an info toast
   */
  info(title: string, message?: string, duration?: number): void {
    this.show('info', title, message, duration);
  }

  /**
   * Show a toast notification
   */
  show(type: ToastType, title: string, message?: string, duration?: number): void {
    const id = `toast-${++this.idCounter}`;
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: duration ?? this.DEFAULT_DURATION,
      dismissible: true
    };

    this.toastsSignal.update(toasts => [...toasts, toast]);

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(id: string): void {
    this.toastsSignal.update(toasts => 
      toasts.filter(t => t.id !== id)
    );
  }

  /**
   * Clear all toasts
   */
  clearAll(): void {
    this.toastsSignal.set([]);
  }
}
