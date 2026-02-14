import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
        <span class="text-4xl">{{ icon }}</span>
      </div>
      <h3 class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
      <p class="text-gray-400 max-w-sm mb-6">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'No Data';
  @Input() message = 'There is no data to display at this time.';
}
