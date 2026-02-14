export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: Date | string;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
}
