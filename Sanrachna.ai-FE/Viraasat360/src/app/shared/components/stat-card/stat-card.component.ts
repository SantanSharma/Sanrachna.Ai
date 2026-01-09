import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors"
         [class]="colorClass">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm text-slate-400 mb-1">{{ title }}</p>
          @if (isCurrency) {
            <p class="text-2xl font-bold text-white">
              {{ value | currency:'INR':'symbol':'1.0-0' }}
            </p>
          } @else {
            <p class="text-2xl font-bold text-white">{{ value }}</p>
          }
          @if (subtitle) {
            <p class="text-xs text-slate-500 mt-1">{{ subtitle }}</p>
          }
        </div>
        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
             [ngClass]="iconBgClass">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      @if (trend !== undefined) {
        <div class="mt-3 flex items-center gap-1">
          @if (trend >= 0) {
            <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="text-xs text-green-400">+{{ trend }}%</span>
          } @else {
            <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span class="text-xs text-red-400">{{ trend }}%</span>
          }
        </div>
      }
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() subtitle?: string;
  @Input() isCurrency = false;
  @Input() trend?: number;
  @Input() colorClass = '';
  @Input() iconBgClass = 'bg-slate-700';
}
