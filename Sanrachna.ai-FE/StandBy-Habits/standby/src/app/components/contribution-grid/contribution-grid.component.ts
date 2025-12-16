import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contribution-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contribution-grid overflow-x-auto">
      <div class="grid-container"
           [class]="compact ? 'gap-0.5' : 'gap-[3px] sm:gap-1'"
           [style.max-height.px]="gridHeight">
        @for (day of gridData; track day.date) {
          <div
            [class]="getGridCellClass(day)"
            [title]="getTooltip(day)"
            [style.width.px]="cellSize"
            [style.height.px]="cellSize">
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .grid-container {
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      align-content: flex-start;
    }
  `]
})
export class ContributionGridComponent {
  @Input() gridData: { date: string; completed?: boolean; count?: number; isToday: boolean; isFuture?: boolean }[] = [];
  @Input() compact = false;
  @Input() showCount = false;
  @Input() maxCount = 5;

  private isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  get cellSize(): number {
    if (this.compact) {
      return this.isMobile ? 6 : 8;
    }
    return this.isMobile ? 10 : 12;
  }

  get gridHeight(): number {
    const gap = this.compact ? 2 : (this.isMobile ? 3 : 4);
    return 7 * this.cellSize + 6 * gap;
  }

  getGridCellClass(day: { date: string; completed?: boolean; count?: number; isToday: boolean; isFuture?: boolean }): string {
    let baseClass = 'rounded-sm transition-all duration-200 ';

    if (day.isToday) {
      baseClass += 'ring-1 ring-standby-accent-blue ring-offset-1 ring-offset-standby-bg ';
    }

    if (day.isFuture) {
      return baseClass + 'bg-standby-grid-empty opacity-30';
    }

    if (this.showCount && day.count !== undefined) {
      const intensity = Math.min(day.count / this.maxCount, 1);
      if (day.count === 0) {
        return baseClass + 'bg-standby-grid-empty';
      } else if (intensity <= 0.33) {
        return baseClass + 'bg-standby-grid-low';
      } else if (intensity <= 0.66) {
        return baseClass + 'bg-standby-grid-medium';
      } else {
        return baseClass + 'bg-standby-grid-high';
      }
    } else {
      return baseClass + (day.completed ? 'bg-standby-accent-green' : 'bg-standby-grid-empty');
    }
  }

  getTooltip(day: { date: string; completed?: boolean; count?: number; isToday: boolean }): string {
    const dateStr = new Date(day.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    if (this.showCount && day.count !== undefined) {
      return `${dateStr}: ${day.count} habit${day.count !== 1 ? 's' : ''} completed`;
    }
    return `${dateStr}: ${day.completed ? 'Completed' : 'Not completed'}`;
  }
}
