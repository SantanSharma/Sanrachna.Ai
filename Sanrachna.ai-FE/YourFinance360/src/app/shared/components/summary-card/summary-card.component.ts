import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="card fade-in hover:shadow-lg transition-shadow duration-200">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-400 mb-1">{{ title }}</p>
          <p class="text-2xl font-bold" [ngClass]="valueColorClass">
            {{ isCurrency ? (numericValue | currency) : value }}
            <span *ngIf="suffix" class="text-sm font-normal text-gray-500">{{ suffix }}</span>
          </p>
          <p *ngIf="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
        </div>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          [ngClass]="iconBgClass"
        >
          {{ icon }}
        </div>
      </div>

      <!-- Progress bar for budget utilization -->
      <div *ngIf="showProgress" class="mt-4">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>{{ progressLabel || 'Progress' }}</span>
          <span>{{ progressValue | number:'1.1-1' }}%</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            [ngClass]="progressBarClass"
            [style.width.%]="progressValue"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SummaryCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() icon = '📊';
  @Input() variant: 'default' | 'success' | 'danger' | 'warning' | 'info' = 'default';
  @Input() isCurrency = true;
  @Input() suffix = '';
  @Input() subtitle = '';
  @Input() showProgress = false;
  @Input() progressValue = 0;
  @Input() progressLabel = '';

  get numericValue(): number {
    return typeof this.value === 'number' ? this.value : parseFloat(this.value) || 0;
  }

  get valueColorClass(): string {
    const colorMap = {
      default: 'text-gray-100',
      success: 'text-success-400',
      danger: 'text-danger-400',
      warning: 'text-warning-400',
      info: 'text-primary-400'
    };
    return colorMap[this.variant];
  }

  get iconBgClass(): string {
    const colorMap = {
      default: 'bg-gray-700 text-gray-300',
      success: 'bg-success-500/20 text-success-400',
      danger: 'bg-danger-500/20 text-danger-400',
      warning: 'bg-warning-500/20 text-warning-400',
      info: 'bg-primary-500/20 text-primary-400'
    };
    return colorMap[this.variant];
  }

  get progressBarClass(): string {
    if (this.progressValue >= 90) return 'bg-danger-500';
    if (this.progressValue >= 70) return 'bg-warning-500';
    return 'bg-success-500';
  }
}
