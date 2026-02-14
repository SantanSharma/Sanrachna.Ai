import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services';
import { Currency, CURRENCIES } from '../../core/models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Settings</h1>
        <p class="text-gray-400">Customize your finance app preferences</p>
      </div>

      <!-- Currency Settings -->
      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">💰</span>
          Currency Settings
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Select Currency
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                *ngFor="let currency of currencies"
                (click)="selectCurrency(currency)"
                class="p-3 rounded-xl border-2 transition-all text-left"
                [ngClass]="settingsService.currency().code === currency.code
                  ? 'border-primary-500 bg-primary-500/20'
                  : 'border-gray-600 hover:border-gray-500'"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xl font-bold">{{ currency.symbol }}</span>
                  <div>
                    <p class="font-medium text-white">{{ currency.code }}</p>
                    <p class="text-xs text-gray-400">{{ currency.name }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div class="bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-300">
              <span class="font-medium">Current currency:</span>
              {{ settingsService.currency().name }} ({{ settingsService.currency().symbol }})
            </p>
            <p class="text-xs text-gray-500 mt-1">
              All amounts in the app will be displayed in this currency.
            </p>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">💾</span>
          Data Management
        </h3>

        <div class="space-y-4">
          <div class="bg-primary-500/20 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <span class="text-2xl">📱</span>
              <div>
                <p class="font-medium text-primary-300">Local Storage</p>
                <p class="text-sm text-primary-400 mt-1">
                  All your financial data is stored locally on this device using IndexedDB.
                  Your data never leaves your device and is completely private.
                </p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-600 pt-4">
            <h4 class="font-medium text-white mb-3">Export & Import</h4>
            <div class="flex gap-3">
              <button
                (click)="exportData()"
                class="btn btn-secondary flex items-center gap-2"
                [disabled]="isExporting()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                {{ isExporting() ? 'Exporting...' : 'Export Data' }}
              </button>
              <label class="btn btn-secondary flex items-center gap-2 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Import Data
                <input
                  type="file"
                  accept=".json"
                  class="hidden"
                  (change)="importData($event)"
                >
              </label>
            </div>
          </div>

          <div class="border-t border-gray-600 pt-4">
            <h4 class="font-medium text-danger-400 mb-3">Danger Zone</h4>
            <button
              (click)="confirmClearData()"
              class="btn btn-danger flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Clear All Data
            </button>
            <p class="text-xs text-gray-500 mt-2">
              This will permanently delete all transactions, budgets, and settings.
            </p>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">ℹ️</span>
          About
        </h3>

        <div class="space-y-3 text-sm text-gray-400">
          <div class="flex justify-between">
            <span>App Name</span>
            <span class="font-medium text-white">YourFinance360</span>
          </div>
          <div class="flex justify-between">
            <span>Version</span>
            <span class="font-medium text-white">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>Storage</span>
            <span class="font-medium text-white">IndexedDB (Local)</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-600">
          <p class="text-sm text-gray-400">
            YourFinance360 is a personal finance management application that helps you
            track your income, expenses, and budgets. All data is stored locally on
            your device for maximum privacy.
          </p>
        </div>
      </div>

      <!-- Clear Data Confirmation -->
      <div
        *ngIf="showClearConfirm()"
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="cancelClear()"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-full max-w-sm p-6 fade-in"
            (click)="$event.stopPropagation()"
          >
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
                <span class="text-3xl">⚠️</span>
              </div>
              <h3 class="text-lg font-semibold text-white mb-2">Clear All Data?</h3>
              <p class="text-gray-400 mb-4">
                This action cannot be undone. All your transactions, budgets, and settings will be permanently deleted.
              </p>
              <div class="mb-4">
                <label class="block text-sm text-gray-300 mb-1">Type "DELETE" to confirm:</label>
                <input
                  type="text"
                  [(ngModel)]="deleteConfirmText"
                  class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg text-center"
                  placeholder="DELETE"
                >
              </div>
              <div class="flex gap-3 justify-center">
                <button (click)="cancelClear()" class="btn btn-secondary">
                  Cancel
                </button>
                <button
                  (click)="clearAllData()"
                  class="btn btn-danger"
                  [disabled]="deleteConfirmText !== 'DELETE'"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
  settingsService = inject(SettingsService);

  currencies = CURRENCIES;

  isExporting = signal(false);
  showClearConfirm = signal(false);
  deleteConfirmText = '';

  async selectCurrency(currency: Currency): Promise<void> {
    try {
      await this.settingsService.setCurrency(currency.code);
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  }

  async exportData(): Promise<void> {
    this.isExporting.set(true);
    try {
      // Get all data from IndexedDB
      const dbRequest = indexedDB.open('YourFinance360DB', 1);

      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const exportData: any = {};
        const storeNames = ['transactions', 'budgets', 'settings'];
        let completed = 0;

        storeNames.forEach(storeName => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            exportData[storeName] = request.result;
            completed++;

            if (completed === storeNames.length) {
              // Create and download file
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `yourfinance360-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              this.isExporting.set(false);
            }
          };
        });
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      this.isExporting.set(false);
    }
  }

  async importData(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const dbRequest = indexedDB.open('YourFinance360DB', 1);

      dbRequest.onsuccess = () => {
        const db = dbRequest.result;

        // Import transactions
        if (data.transactions) {
          const transaction = db.transaction('transactions', 'readwrite');
          const store = transaction.objectStore('transactions');
          store.clear();
          data.transactions.forEach((item: any) => {
            delete item.id; // Remove id to let IndexedDB auto-generate
            store.add(item);
          });
        }

        // Import budgets
        if (data.budgets) {
          const transaction = db.transaction('budgets', 'readwrite');
          const store = transaction.objectStore('budgets');
          store.clear();
          data.budgets.forEach((item: any) => {
            delete item.id;
            store.add(item);
          });
        }

        // Import settings
        if (data.settings && data.settings.length > 0) {
          const transaction = db.transaction('settings', 'readwrite');
          const store = transaction.objectStore('settings');
          store.clear();
          const settings = data.settings[0];
          delete settings.id;
          store.add(settings);
        }

        // Reload page to refresh all data
        window.location.reload();
      };
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }

    // Reset input
    input.value = '';
  }

  confirmClearData(): void {
    this.deleteConfirmText = '';
    this.showClearConfirm.set(true);
  }

  cancelClear(): void {
    this.showClearConfirm.set(false);
    this.deleteConfirmText = '';
  }

  async clearAllData(): Promise<void> {
    if (this.deleteConfirmText !== 'DELETE') return;

    try {
      const dbRequest = indexedDB.open('YourFinance360DB', 1);

      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const storeNames = ['transactions', 'budgets', 'settings'];

        storeNames.forEach(storeName => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          store.clear();
        });

        // Reload page
        window.location.reload();
      };
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}
