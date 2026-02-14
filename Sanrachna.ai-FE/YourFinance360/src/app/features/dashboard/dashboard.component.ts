import { Component, OnInit, inject, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService, BudgetService, SettingsService } from '../../core/services';
import { SummaryCardComponent, EmptyStateComponent } from '../../shared/components';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { getCategoryById, EXPENSE_CATEGORIES } from '../../core/models/category.model';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SummaryCardComponent, EmptyStateComponent, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <p class="text-gray-400">Your financial overview at a glance</p>
        </div>
        <div class="flex gap-3">
          <button
            routerLink="/transactions"
            [queryParams]="{ action: 'add', type: 'expense' }"
            class="btn btn-danger flex items-center gap-2"
          >
            <span>−</span> Add Expense
          </button>
          <button
            routerLink="/transactions"
            [queryParams]="{ action: 'add', type: 'income' }"
            class="btn btn-success flex items-center gap-2"
          >
            <span>+</span> Add Income
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-summary-card
          title="Total Income"
          [value]="transactionService.summary().totalIncome"
          icon="💰"
          variant="success"
        />
        <app-summary-card
          title="Total Expenses"
          [value]="transactionService.summary().totalExpenses"
          icon="💸"
          variant="danger"
        />
        <app-summary-card
          title="Net Balance"
          [value]="transactionService.summary().netBalance"
          icon="📊"
          [variant]="transactionService.summary().netBalance >= 0 ? 'success' : 'danger'"
        />
        <app-summary-card
          title="Monthly Budget"
          [value]="currentMonthBudget().totalBudget"
          icon="📅"
          variant="info"
          [showProgress]="currentMonthBudget().totalBudget > 0"
          [progressValue]="currentMonthBudget().utilizationPercentage"
          progressLabel="Spent"
        />
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Monthly Overview Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold text-white mb-4">Monthly Overview</h3>
          <div class="relative h-64">
            <canvas id="monthlyChart"></canvas>
          </div>
        </div>

        <!-- Category Distribution Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold text-white mb-4">Expense by Category</h3>
          <div class="relative h-64">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Recent Transactions</h3>
          <a routerLink="/transactions" class="text-primary-400 hover:text-primary-300 text-sm font-medium">
            View All →
          </a>
        </div>

        <div *ngIf="recentTransactions().length === 0">
          <app-empty-state
            icon="📝"
            title="No transactions yet"
            message="Start tracking your finances by adding your first transaction."
          >
            <button routerLink="/transactions" [queryParams]="{ action: 'add' }" class="btn btn-primary">
              Add Transaction
            </button>
          </app-empty-state>
        </div>

        <div *ngIf="recentTransactions().length > 0" class="space-y-3">
          <div
            *ngFor="let transaction of recentTransactions()"
            class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                [ngClass]="transaction.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20'"
              >
                {{ getCategoryIcon(transaction.category) }}
              </div>
              <div>
                <p class="font-medium text-white">{{ getCategoryName(transaction.category) }}</p>
                <p class="text-sm text-gray-400">{{ transaction.date | date:'MMM d, y' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p
                class="font-semibold"
                [ngClass]="transaction.type === 'income' ? 'text-success-400' : 'text-danger-400'"
              >
                {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | currency }}
              </p>
              <p *ngIf="transaction.notes" class="text-xs text-gray-500 truncate max-w-[150px]">
                {{ transaction.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Budget Status</h3>
          <a routerLink="/budget" class="text-primary-400 hover:text-primary-300 text-sm font-medium">
            Manage Budget →
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Annual Budget -->
          <div class="p-4 bg-gradient-to-br from-primary-900/50 to-primary-800/50 rounded-xl border border-primary-700/30">
            <p class="text-sm text-primary-300 font-medium mb-1">Annual Budget {{ currentYear() }}</p>
            <p class="text-2xl font-bold text-primary-100">{{ annualBudget().annualBudget | currency }}</p>
            <div class="mt-2">
              <div class="flex justify-between text-xs text-primary-400 mb-1">
                <span>Spent: {{ annualBudget().totalSpent | currency }}</span>
                <span>{{ getAnnualUtilization() | number:'1.0-0' }}%</span>
              </div>
              <div class="w-full bg-primary-900/50 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  [ngClass]="getAnnualUtilization() >= 90 ? 'bg-danger-500' : getAnnualUtilization() >= 70 ? 'bg-warning-500' : 'bg-primary-500'"
                  [style.width.%]="Math.min(getAnnualUtilization(), 100)"
                ></div>
              </div>
            </div>
          </div>

          <!-- This Month -->
          <div class="p-4 bg-gradient-to-br from-success-900/50 to-success-800/50 rounded-xl border border-success-700/30">
            <p class="text-sm text-success-300 font-medium mb-1">This Month</p>
            <p class="text-2xl font-bold text-success-100">{{ currentMonthBudget().totalBudget | currency }}</p>
            <div class="mt-2">
              <div class="flex justify-between text-xs text-success-400 mb-1">
                <span>Spent: {{ currentMonthBudget().totalSpent | currency }}</span>
                <span>{{ currentMonthBudget().utilizationPercentage | number:'1.0-0' }}%</span>
              </div>
              <div class="w-full bg-success-900/50 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  [ngClass]="currentMonthBudget().utilizationPercentage >= 90 ? 'bg-danger-500' : currentMonthBudget().utilizationPercentage >= 70 ? 'bg-warning-500' : 'bg-success-500'"
                  [style.width.%]="Math.min(currentMonthBudget().utilizationPercentage, 100)"
                ></div>
              </div>
            </div>
          </div>

          <!-- Remaining -->
          <div class="p-4 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-xl border border-gray-600/30">
            <p class="text-sm text-gray-300 font-medium mb-1">Remaining This Month</p>
            <p
              class="text-2xl font-bold"
              [ngClass]="currentMonthBudget().remaining >= 0 ? 'text-success-400' : 'text-danger-400'"
            >
              {{ currentMonthBudget().remaining | currency }}
            </p>
            <p class="text-xs text-gray-400 mt-2">
              {{ currentMonthBudget().remaining >= 0 ? 'Keep up the good work! 👍' : 'You\'ve exceeded your budget! ⚠️' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  transactionService = inject(TransactionService);
  budgetService = inject(BudgetService);
  settingsService = inject(SettingsService);

  private isBrowser: boolean;
  private monthlyChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  Math = Math;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      Chart.register(...registerables);
    }
  }

  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1);

  recentTransactions = computed(() => {
    return this.transactionService.transactions().slice(0, 5);
  });

  currentMonthBudget = computed(() => {
    return this.budgetService.getBudgetSummary(this.currentYear(), this.currentMonth());
  });

  annualBudget = computed(() => {
    return this.budgetService.getAnnualBudgetOverview(this.currentYear());
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initCharts();
      }, 100);
    }
  }

  getAnnualUtilization(): number {
    const budget = this.annualBudget();
    return budget.annualBudget > 0
      ? (budget.totalSpent / budget.annualBudget) * 100
      : 0;
  }

  getCategoryIcon(categoryId: string): string {
    return getCategoryById(categoryId)?.icon || '📦';
  }

  getCategoryName(categoryId: string): string {
    return getCategoryById(categoryId)?.name || categoryId;
  }

  private initCharts(): void {
    this.initMonthlyChart();
    this.initCategoryChart();
  }

  private initMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const monthlyData = this.transactionService.getMonthlyData(this.currentYear());

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'Income',
            data: monthlyData.map(d => d.income),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 4
          },
          {
            label: 'Expenses',
            data: monthlyData.map(d => d.expenses),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#9ca3af'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(75, 85, 99, 0.3)'
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af'
            }
          }
        }
      }
    });
  }

  private initCategoryChart(): void {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    const categoryData = this.transactionService.getExpensesByCategory(this.currentYear());

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const colors = categoryData.map(d => {
      const category = getCategoryById(d.category);
      return category?.color || '#78716c';
    });

    this.categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: categoryData.map(d => getCategoryById(d.category)?.name || d.category),
        datasets: [{
          data: categoryData.map(d => d.amount),
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 15,
              color: '#9ca3af'
            }
          }
        }
      }
    });
  }
}
