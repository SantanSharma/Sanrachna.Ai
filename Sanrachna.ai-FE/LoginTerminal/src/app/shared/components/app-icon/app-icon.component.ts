import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * App Icon Component
 * Displays an icon with a colored background container.
 * Used for application cards on the dashboard.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="icon-container rounded-xl flex items-center justify-center"
      [ngClass]="[colorClass, sizeClass]"
    >
      <span 
        class="material-icons-outlined"
        [ngClass]="iconSizeClass"
      >
        {{ icon }}
      </span>
    </div>
  `,
  styles: []
})
export class AppIconComponent {
  @Input() icon: string = 'apps';
  @Input() colorClass: string = 'bg-blue-500';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get sizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'w-10 h-10';
      case 'md':
        return 'w-14 h-14';
      case 'lg':
        return 'w-16 h-16';
      case 'xl':
        return 'w-20 h-20';
      default:
        return 'w-14 h-14';
    }
  }

  get iconSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'text-xl';
      case 'md':
        return 'text-2xl';
      case 'lg':
        return 'text-3xl';
      case 'xl':
        return 'text-4xl';
      default:
        return 'text-2xl';
    }
  }
}
