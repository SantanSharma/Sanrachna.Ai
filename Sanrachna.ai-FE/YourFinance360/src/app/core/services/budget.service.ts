import { Injectable, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { TransactionService } from './transaction.service';
import { Budget, BudgetSummary, MonthlyBudgetOverview, AnnualBudgetOverview } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budgetsSignal = signal<Budget[]>([]);

  readonly budgets = this.budgetsSignal.asReadonly();

  constructor(
    private db: DatabaseService,
    private transactionService: TransactionService
  ) {
    this.loadBudgets();
  }

  async loadBudgets(): Promise<void> {
    try {
      const budgets = await this.db.getAll<'budgets'>('budgets');
      this.budgetsSignal.set(budgets);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      throw error;
    }
  }

  async setAnnualBudget(year: number, amount: number): Promise<number> {
    try {
      // Check if annual budget exists for this year
      const existingBudgets = this.budgetsSignal().filter(
        b => b.year === year && b.type === 'annual'
      );

      if (existingBudgets.length > 0) {
        // Update existing
        const existing = existingBudgets[0];
        await this.db.update('budgets', { ...existing, amount });
        await this.loadBudgets();
        return existing.id!;
      } else {
        // Create new
        const budget: Budget = {
          year,
          amount,
          type: 'annual'
        };
        const id = await this.db.add('budgets', budget);
        await this.loadBudgets();
        return id;
      }
    } catch (error) {
      console.error('Failed to set annual budget:', error);
      throw error;
    }
  }

  async setMonthlyBudget(year: number, month: number, amount: number): Promise<number> {
    try {
      // Check if monthly budget exists for this year/month
      const existingBudgets = this.budgetsSignal().filter(
        b => b.year === year && b.month === month && b.type === 'monthly'
      );

      if (existingBudgets.length > 0) {
        // Update existing
        const existing = existingBudgets[0];
        await this.db.update('budgets', { ...existing, amount });
        await this.loadBudgets();
        return existing.id!;
      } else {
        // Create new
        const budget: Budget = {
          year,
          month,
          amount,
          type: 'monthly'
        };
        const id = await this.db.add('budgets', budget);
        await this.loadBudgets();
        return id;
      }
    } catch (error) {
      console.error('Failed to set monthly budget:', error);
      throw error;
    }
  }

  async deleteBudget(id: number): Promise<void> {
    try {
      await this.db.delete('budgets', id);
      await this.loadBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  }

  getAnnualBudget(year: number): Budget | undefined {
    return this.budgetsSignal().find(b => b.year === year && b.type === 'annual');
  }

  getMonthlyBudget(year: number, month: number): Budget | undefined {
    return this.budgetsSignal().find(
      b => b.year === year && b.month === month && b.type === 'monthly'
    );
  }

  getMonthlyBudgets(year: number): Budget[] {
    return this.budgetsSignal()
      .filter(b => b.year === year && b.type === 'monthly')
      .sort((a, b) => (a.month || 0) - (b.month || 0));
  }

  getBudgetSummary(year: number, month?: number): BudgetSummary {
    let totalBudget = 0;
    let totalSpent = 0;

    if (month !== undefined) {
      // Monthly budget summary
      const monthlyBudget = this.getMonthlyBudget(year, month);
      totalBudget = monthlyBudget?.amount || 0;
      totalSpent = this.transactionService.getTotalExpensesForMonth(year, month);
    } else {
      // Annual budget summary
      const annualBudget = this.getAnnualBudget(year);
      totalBudget = annualBudget?.amount || 0;
      totalSpent = this.transactionService.getTotalExpensesForYear(year);
    }

    const remaining = totalBudget - totalSpent;
    const utilizationPercentage = totalBudget > 0
      ? Math.min((totalSpent / totalBudget) * 100, 100)
      : 0;

    return {
      totalBudget,
      totalSpent,
      remaining,
      utilizationPercentage
    };
  }

  getMonthlyBudgetOverview(year: number): MonthlyBudgetOverview[] {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames.map((monthName, index) => {
      const month = index + 1;
      const budget = this.getMonthlyBudget(year, month);
      const spent = this.transactionService.getTotalExpensesForMonth(year, month);
      const budgetAmount = budget?.amount || 0;
      const remaining = budgetAmount - spent;
      const utilizationPercentage = budgetAmount > 0
        ? Math.min((spent / budgetAmount) * 100, 100)
        : 0;

      return {
        month,
        monthName,
        budget: budgetAmount,
        spent,
        remaining,
        utilizationPercentage
      };
    });
  }

  getAnnualBudgetOverview(year: number): AnnualBudgetOverview {
    const annualBudget = this.getAnnualBudget(year);
    const monthlyBudgets = this.getMonthlyBudgets(year);
    const totalMonthlyBudgets = monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = this.transactionService.getTotalExpensesForYear(year);
    const annualAmount = annualBudget?.amount || 0;
    const remaining = annualAmount - totalSpent;

    return {
      year,
      annualBudget: annualAmount,
      totalMonthlyBudgets,
      totalSpent,
      remaining,
      monthlyOverview: this.getMonthlyBudgetOverview(year)
    };
  }

  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const budgetYears = this.budgetsSignal().map(b => b.year);
    const years = new Set([currentYear, ...budgetYears]);
    return Array.from(years).sort((a, b) => b - a);
  }
}
