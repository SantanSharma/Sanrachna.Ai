import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="onCancel()"></div>

        <div class="relative bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center gap-4 mb-4">
            @if (type === 'danger') {
              <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            } @else {
              <div class="w-12 h-12 rounded-full bg-app-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-app-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            <div>
              <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
              <p class="text-sm text-slate-400 mt-1">{{ message }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="onCancel()"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              (click)="onConfirm()"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [ngClass]="type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-app-600 hover:bg-app-700 text-white'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'default' | 'danger' = 'default';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
