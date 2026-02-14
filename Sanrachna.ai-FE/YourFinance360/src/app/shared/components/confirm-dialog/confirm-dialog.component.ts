import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-full max-w-sm transition-all fade-in"
          (click)="$event.stopPropagation()"
        >
          <div class="p-6 text-center">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              [ngClass]="iconBgClass"
            >
              <span class="text-3xl">{{ icon }}</span>
            </div>

            <h3 class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
            <p class="text-gray-400 mb-6">{{ message }}</p>

            <div class="flex gap-3 justify-center">
              <button
                (click)="onCancel()"
                class="btn btn-secondary"
              >
                {{ cancelText }}
              </button>
              <button
                (click)="onConfirm()"
                class="btn"
                [ngClass]="confirmButtonClass"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger';
  @Input() icon = '⚠️';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get iconBgClass(): string {
    const map = {
      danger: 'bg-danger-500/20',
      warning: 'bg-warning-500/20',
      info: 'bg-primary-500/20'
    };
    return map[this.variant];
  }

  get confirmButtonClass(): string {
    const map = {
      danger: 'btn-danger',
      warning: 'btn-primary',
      info: 'btn-primary'
    };
    return map[this.variant];
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
