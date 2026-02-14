import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService, SettingsService } from '../../core/services';
import { ModalComponent, EmptyStateComponent, SummaryCardComponent } from '../../shared/components';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { MonthlyBudgetOverview } from '../../core/models/budget.model';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    EmptyStateComponent,
    SummaryCardComponent,
    CurrencyPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Budget Management</h1>
          <p class="text-gray-400">Set and track your annual and monthly budgets</p>
        </div>
        <div class="flex items-center gap-3">
          <select
            [(ngModel)]="selectedYear"
            class="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
          >
            <option *ngFor="let year of availableYears()" [value]="year">{{ year }}</option>
          </select>
          <button
            (click)="openAnnualBudgetModal()"
            class="btn btn-primary"
          >
            Set Annual Budget
          </button>
        </div>
      </div>

      <!-- Annual Budget Summary -->
      <div class="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 class="text-lg font-medium text-primary-100 mb-1">Annual Budget {{ selectedYear }}</h2>
            <p class="text-4xl font-bold">{{ annualOverview().annualBudget | currency }}</p>
            <p class="text-primary-200 mt-2">
              Spent: {{ annualOverview().totalSpent | currency }} •
              Remaining: {{ annualOverview().remaining | currency }}
            </p>
          </div>
          <div class="w-full md:w-64">
            <div class="flex justify-between text-sm text-primary-200 mb-2">
              <span>Progress</span>
              <span>{{ getAnnualUtilization() | number:'1.0-0' }}%</span>
            </div>
            <div class="w-full bg-primary-900 bg-opacity-50 rounded-full h-4">
              <div
                class="h-4 rounded-full transition-all duration-500"
                [ngClass]="getProgressBarColor(getAnnualUtilization())"
                [style.width.%]="Math.min(getAnnualUtilization(), 100)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Budgets Grid -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Monthly Budgets</h3>
          <button
            (click)="openMonthlyBudgetModal()"
            class="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Set Monthly Budget
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            *ngFor="let month of monthlyOverview()"
            class="card hover:shadow-md transition-shadow cursor-pointer"
            (click)="editMonthlyBudget(month)"
            [ngClass]="getMonthCardClass(month)"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="font-semibold text-white">{{ month.monthName }}</p>
                <p class="text-2xl font-bold text-white mt-1">{{ month.budget | currency }}</p>
              </div>
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                [ngClass]="getStatusBadgeClass(month)"
              >
                <span class="text-lg">{{ getStatusIcon(month) }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Spent</span>
                <span class="font-medium text-white">{{ month.spent | currency }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Remaining</span>
                <span
                  class="font-medium"
                  [ngClass]="month.remaining >= 0 ? 'text-success-600' : 'text-danger-600'"
                >
                  {{ month.remaining | currency }}
                </span>
              </div>

              <div class="mt-3">
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Utilization</span>
                  <span>{{ month.utilizationPercentage | number:'1.0-0' }}%</span>
                </div>
                <div class="w-full bg-gray-600 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    [ngClass]="getProgressBarColor(month.utilizationPercentage)"
                    [style.width.%]="Math.min(month.utilizationPercentage, 100)"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Edit indicator -->
            <div class="mt-3 pt-3 border-t border-gray-600 flex justify-center">
              <span class="text-xs text-gray-500">Click to edit</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Tips -->
      <div class="card bg-gradient-to-br from-warning-900/50 to-warning-800/30 border border-warning-700/30">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center flex-shrink-0">
            <span class="text-2xl">💡</span>
          </div>
          <div>
            <h4 class="font-semibold text-warning-400 mb-1">Budget Tips</h4>
            <ul class="text-sm text-warning-300 space-y-1">
              <li>• Set realistic monthly budgets based on your income</li>
              <li>• Review your spending patterns regularly</li>
              <li>• Try to keep expenses below 90% of your budget</li>
              <li>• Consider setting aside savings as part of your budget</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Annual Budget Modal -->
    <app-modal
      [isOpen]="isAnnualModalOpen()"
      title="Set Annual Budget"
      size="md"
      (closed)="closeAnnualModal()"
    >
      <form [formGroup]="annualBudgetForm" (ngSubmit)="saveAnnualBudget()">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Annual Budget for {{ selectedYear }} <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {{ settingsService.currencySymbol() }}
            </span>
            <input
              type="number"
              formControlName="amount"
              class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-lg"
              placeholder="0.00"
              min="0"
              step="1000"
            >
          </div>
          <p *ngIf="annualBudgetForm.get('amount')?.touched && annualBudgetForm.get('amount')?.errors?.['required']"
             class="text-danger-500 text-sm mt-1">
            Budget amount is required
          </p>
          <p *ngIf="annualBudgetForm.get('amount')?.touched && annualBudgetForm.get('amount')?.errors?.['min']"
             class="text-danger-500 text-sm mt-1">
            Budget must be a positive number
          </p>
        </div>

        <div class="flex gap-3 justify-end">
          <button type="button" (click)="closeAnnualModal()" class="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="annualBudgetForm.invalid || isSaving()"
          >
            {{ isSaving() ? 'Saving...' : 'Save Budget' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Monthly Budget Modal -->
    <app-modal
      [isOpen]="isMonthlyModalOpen()"
      title="Set Monthly Budget"
      size="md"
      (closed)="closeMonthlyModal()"
    >
      <form [formGroup]="monthlyBudgetForm" (ngSubmit)="saveMonthlyBudget()">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Month <span class="text-danger-500">*</span>
          </label>
          <select
            formControlName="month"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option *ngFor="let month of months" [value]="month.value">{{ month.label }}</option>
          </select>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Budget Amount <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {{ settingsService.currencySymbol() }}
            </span>
            <input
              type="number"
              formControlName="amount"
              class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-lg"
              placeholder="0.00"
              min="0"
              step="100"
            >
          </div>
          <p *ngIf="monthlyBudgetForm.get('amount')?.touched && monthlyBudgetForm.get('amount')?.errors?.['required']"
             class="text-danger-500 text-sm mt-1">
            Budget amount is required
          </p>
          <p *ngIf="monthlyBudgetForm.get('amount')?.touched && monthlyBudgetForm.get('amount')?.errors?.['min']"
             class="text-danger-500 text-sm mt-1">
            Budget must be a positive number
          </p>
        </div>

        <div class="flex gap-3 justify-end">
          <button type="button" (click)="closeMonthlyModal()" class="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="monthlyBudgetForm.invalid || isSaving()"
          >
            {{ isSaving() ? 'Saving...' : 'Save Budget' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class BudgetComponent {
  private fb = inject(FormBuilder);
  budgetService = inject(BudgetService);
  settingsService = inject(SettingsService);

  Math = Math;

  selectedYear = new Date().getFullYear();

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // State
  isAnnualModalOpen = signal(false);
  isMonthlyModalOpen = signal(false);
  isSaving = signal(false);

  // Forms
  annualBudgetForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0)]]
  });

  monthlyBudgetForm: FormGroup = this.fb.group({
    month: [new Date().getMonth() + 1, Validators.required],
    amount: [null, [Validators.required, Validators.min(0)]]
  });

  availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = this.budgetService.getAvailableYears();
    // Add next year and previous years if not included
    const allYears = new Set([currentYear - 1, currentYear, currentYear + 1, ...years]);
    return Array.from(allYears).sort((a, b) => b - a);
  });

  annualOverview = computed(() => {
    return this.budgetService.getAnnualBudgetOverview(this.selectedYear);
  });

  monthlyOverview = computed(() => {
    return this.budgetService.getMonthlyBudgetOverview(this.selectedYear);
  });

  getAnnualUtilization(): number {
    const overview = this.annualOverview();
    return overview.annualBudget > 0
      ? (overview.totalSpent / overview.annualBudget) * 100
      : 0;
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 90) return 'bg-danger-500';
    if (percentage >= 70) return 'bg-warning-500';
    return 'bg-success-500';
  }

  getMonthCardClass(month: MonthlyBudgetOverview): string {
    if (month.budget === 0) return 'opacity-60';
    if (month.utilizationPercentage >= 100) return 'border-l-4 border-l-danger-500';
    if (month.utilizationPercentage >= 90) return 'border-l-4 border-l-warning-500';
    return '';
  }

  getStatusBadgeClass(month: MonthlyBudgetOverview): string {
    if (month.budget === 0) return 'bg-gray-600';
    if (month.utilizationPercentage >= 100) return 'bg-danger-500/20';
    if (month.utilizationPercentage >= 90) return 'bg-warning-500/20';
    return 'bg-success-500/20';
  }

  getStatusIcon(month: MonthlyBudgetOverview): string {
    if (month.budget === 0) return '📝';
    if (month.utilizationPercentage >= 100) return '⚠️';
    if (month.utilizationPercentage >= 90) return '⏳';
    return '✅';
  }

  openAnnualBudgetModal(): void {
    const currentBudget = this.budgetService.getAnnualBudget(this.selectedYear);
    this.annualBudgetForm.patchValue({
      amount: currentBudget?.amount || null
    });
    this.isAnnualModalOpen.set(true);
  }

  closeAnnualModal(): void {
    this.isAnnualModalOpen.set(false);
    this.annualBudgetForm.reset();
  }

  async saveAnnualBudget(): Promise<void> {
    if (this.annualBudgetForm.invalid) return;

    this.isSaving.set(true);
    try {
      const amount = parseFloat(this.annualBudgetForm.get('amount')?.value);
      await this.budgetService.setAnnualBudget(this.selectedYear, amount);
      this.closeAnnualModal();
    } catch (error) {
      console.error('Failed to save annual budget:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  openMonthlyBudgetModal(): void {
    this.monthlyBudgetForm.patchValue({
      month: new Date().getMonth() + 1,
      amount: null
    });
    this.isMonthlyModalOpen.set(true);
  }

  editMonthlyBudget(month: MonthlyBudgetOverview): void {
    this.monthlyBudgetForm.patchValue({
      month: month.month,
      amount: month.budget || null
    });
    this.isMonthlyModalOpen.set(true);
  }

  closeMonthlyModal(): void {
    this.isMonthlyModalOpen.set(false);
    this.monthlyBudgetForm.reset();
  }

  async saveMonthlyBudget(): Promise<void> {
    if (this.monthlyBudgetForm.invalid) return;

    this.isSaving.set(true);
    try {
      const month = parseInt(this.monthlyBudgetForm.get('month')?.value);
      const amount = parseFloat(this.monthlyBudgetForm.get('amount')?.value);
      await this.budgetService.setMonthlyBudget(this.selectedYear, month, amount);
      this.closeMonthlyModal();
    } catch (error) {
      console.error('Failed to save monthly budget:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
