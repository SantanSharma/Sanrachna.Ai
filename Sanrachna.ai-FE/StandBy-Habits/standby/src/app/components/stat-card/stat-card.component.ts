import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card bg-standby-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-standby-border hover:border-standby-card-hover transition-all duration-300">
      <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
        <div
          class="icon-wrapper w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
          [class]="iconBgClass">
          <ng-content select="[icon]"></ng-content>
        </div>
        <div class="flex flex-col">
          <span class="text-lg sm:text-2xl font-bold text-standby-text">{{ value }}</span>
          <span class="text-xs sm:text-sm text-standby-text-muted leading-tight">{{ label }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class StatCardComponent {
  @Input() value: string | number = 0;
  @Input() label = '';
  @Input() iconBgClass = 'bg-standby-accent-blue/20';
}
