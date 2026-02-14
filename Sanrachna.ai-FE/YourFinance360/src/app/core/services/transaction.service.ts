import { Injectable, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import {
  Transaction,
  TransactionType,
  TransactionSummary,
  CategorySummary,
  MonthlyData
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSignal = signal<Transaction[]>([]);

  readonly transactions = this.transactionsSignal.asReadonly();

  readonly summary = computed<TransactionSummary>(() => {
    const transactions = this.transactionsSignal();
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  });

  constructor(private db: DatabaseService) {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    try {
      const transactions = await this.db.getAll<'transactions'>('transactions');
      // Sort by date descending
      transactions.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.transactionsSignal.set(transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      throw error;
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
    try {
      const id = await this.db.add('transactions', transaction as Transaction);
      await this.loadTransactions();
      return id;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    try {
      await this.db.update('transactions', transaction);
      await this.loadTransactions();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      await this.db.delete('transactions', id);
      await this.loadTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }

  getTransactionsByType(type: TransactionType): Transaction[] {
    return this.transactionsSignal().filter(t => t.type === type);
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactionsSignal().filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  getTransactionsByMonth(year: number, month: number): Transaction[] {
    return this.transactionsSignal().filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  getTransactionsByYear(year: number): Transaction[] {
    return this.transactionsSignal().filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year;
    });
  }

  getExpensesByCategory(year?: number, month?: number): CategorySummary[] {
    let expenses = this.transactionsSignal().filter(t => t.type === 'expense');

    if (year !== undefined) {
      expenses = expenses.filter(t => {
        const date = new Date(t.date);
        const matchesYear = date.getFullYear() === year;
        const matchesMonth = month === undefined || date.getMonth() + 1 === month;
        return matchesYear && matchesMonth;
      });
    }

    const categoryMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(t => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1
      });
    });

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        count: data.count
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getMonthlyData(year: number): MonthlyData[] {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return monthNames.map((month, index) => {
      const monthTransactions = this.getTransactionsByMonth(year, index + 1);
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month,
        year,
        income,
        expenses,
        balance: income - expenses
      };
    });
  }

  getTotalExpensesForMonth(year: number, month: number): number {
    return this.getTransactionsByMonth(year, month)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpensesForYear(year: number): number {
    return this.getTransactionsByYear(year)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
