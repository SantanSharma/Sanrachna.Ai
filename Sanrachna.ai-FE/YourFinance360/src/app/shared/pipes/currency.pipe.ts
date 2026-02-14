import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';

@Pipe({
  name: 'currency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  private settingsService = inject(SettingsService);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return this.settingsService.formatAmount(0);
    }
    return this.settingsService.formatAmount(value);
  }
}
