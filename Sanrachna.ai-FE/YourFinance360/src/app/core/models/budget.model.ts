export interface Budget {
  id?: number;
  year: number;
  month?: number; // 1-12 for monthly budget, undefined for annual
  amount: number;
  type: 'annual' | 'monthly';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationPercentage: number;
}

export interface MonthlyBudgetOverview {
  month: number;
  monthName: string;
  budget: number;
  spent: number;
  remaining: number;
  utilizationPercentage: number;
}

export interface AnnualBudgetOverview {
  year: number;
  annualBudget: number;
  totalMonthlyBudgets: number;
  totalSpent: number;
  remaining: number;
  monthlyOverview: MonthlyBudgetOverview[];
}
