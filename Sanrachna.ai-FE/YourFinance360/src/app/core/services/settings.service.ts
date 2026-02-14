import { Injectable, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { Settings, Currency, CURRENCIES, DEFAULT_CURRENCY } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSignal = signal<Settings | null>(null);

  readonly settings = this.settingsSignal.asReadonly();

  readonly currency = computed<Currency>(() => {
    const settings = this.settingsSignal();
    const currencyCode = settings?.currencyCode || DEFAULT_CURRENCY;
    return CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  });

  readonly currencySymbol = computed(() => this.currency().symbol);

  constructor(private db: DatabaseService) {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    try {
      const settings = await this.db.getSettings();
      this.settingsSignal.set(settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw error;
    }
  }

  async setCurrency(currencyCode: string): Promise<void> {
    try {
      await this.db.updateSettings({ currencyCode });
      await this.loadSettings();
    } catch (error) {
      console.error('Failed to update currency:', error);
      throw error;
    }
  }

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await this.db.updateSettings({ theme });
      await this.loadSettings();
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }

  getAvailableCurrencies(): Currency[] {
    return CURRENCIES;
  }

  formatAmount(amount: number): string {
    const currency = this.currency();
    return `${currency.symbol}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
