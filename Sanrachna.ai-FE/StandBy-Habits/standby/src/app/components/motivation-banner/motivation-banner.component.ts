import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-motivation-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="motivation-banner text-center py-6 px-4">
      <p class="text-standby-text-muted text-lg md:text-xl font-light italic">
        "{{ motivationalQuote }}"
      </p>
    </div>
  `,
  styles: [`
    .motivation-banner {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class MotivationBannerComponent {
  private habitService = inject(HabitService);

  motivationalQuote = this.habitService.getDailyMotivation();
}
