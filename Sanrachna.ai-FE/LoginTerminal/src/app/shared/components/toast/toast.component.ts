import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { Toast } from '../../../core/models';

/**
 * Toast Component
 * Displays toast notifications in the bottom-right corner of the screen.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-up"
          [ngClass]="getToastClasses(toast.type)"
          role="alert"
        >
          <!-- Icon -->
          <span class="material-icons-outlined text-xl flex-shrink-0">
            {{ getToastIcon(toast.type) }}
          </span>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs opacity-80 mt-0.5">{{ toast.message }}</p>
            }
          </div>
          
          <!-- Close button -->
          @if (toast.dismissible) {
            <button 
              (click)="dismiss(toast.id)"
              class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <span class="material-icons-outlined text-lg">close</span>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class ToastComponent {
  protected toastService = inject(ToastService);

  getToastClasses(type: Toast['type']): string {
    const baseClasses = 'border';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-900/90 border-green-700 text-green-100`;
      case 'error':
        return `${baseClasses} bg-red-900/90 border-red-700 text-red-100`;
      case 'warning':
        return `${baseClasses} bg-yellow-900/90 border-yellow-700 text-yellow-100`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-900/90 border-blue-700 text-blue-100`;
    }
  }

  getToastIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
