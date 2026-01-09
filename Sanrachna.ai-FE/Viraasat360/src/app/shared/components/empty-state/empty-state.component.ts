import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <ng-content select="[icon]"></ng-content>
      </div>
      <h3 class="text-lg font-medium text-white mb-2">{{ title }}</h3>
      <p class="text-sm text-slate-400 max-w-sm mx-auto mb-6">{{ message }}</p>
      <ng-content select="[action]"></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'No data yet';
  @Input() message = 'Get started by adding your first item.';
}
