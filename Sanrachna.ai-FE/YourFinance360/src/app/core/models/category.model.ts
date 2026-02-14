export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', type: 'expense', color: '#ef4444' },
  { id: 'rent', name: 'Rent', icon: '🏠', type: 'expense', color: '#f97316' },
  { id: 'utilities', name: 'Utilities', icon: '💡', type: 'expense', color: '#eab308' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', type: 'expense', color: '#22c55e' },
  { id: 'healthcare', name: 'Health & Medical', icon: '🏥', type: 'expense', color: '#06b6d4' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', type: 'expense', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', type: 'expense', color: '#ec4899' },
  { id: 'education', name: 'Education', icon: '📚', type: 'expense', color: '#6366f1' },
  { id: 'travel', name: 'Travel', icon: '✈️', type: 'expense', color: '#14b8a6' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', type: 'expense', color: '#64748b' },
  { id: 'debt', name: 'Debt Payment', icon: '💳', type: 'expense', color: '#dc2626' },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', type: 'expense', color: '#f43f5e' },
  { id: 'personal', name: 'Personal Care', icon: '💆', type: 'expense', color: '#a855f7' },
  { id: 'pets', name: 'Pets', icon: '🐕', type: 'expense', color: '#84cc16' },
  { id: 'other_expense', name: 'Other', icon: '📦', type: 'expense', color: '#78716c' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: '💼', type: 'income', color: '#22c55e' },
  { id: 'freelance', name: 'Freelance', icon: '💻', type: 'income', color: '#3b82f6' },
  { id: 'business', name: 'Business', icon: '🏢', type: 'income', color: '#8b5cf6' },
  { id: 'investments', name: 'Investments', icon: '📈', type: 'income', color: '#06b6d4' },
  { id: 'rental', name: 'Rental Income', icon: '🏘️', type: 'income', color: '#f97316' },
  { id: 'interest', name: 'Interest', icon: '🏦', type: 'income', color: '#14b8a6' },
  { id: 'dividends', name: 'Dividends', icon: '💰', type: 'income', color: '#eab308' },
  { id: 'refunds', name: 'Refunds', icon: '↩️', type: 'income', color: '#64748b' },
  { id: 'gifts_received', name: 'Gifts Received', icon: '🎀', type: 'income', color: '#ec4899' },
  { id: 'bonus', name: 'Bonus', icon: '🎉', type: 'income', color: '#10b981' },
  { id: 'other_income', name: 'Other', icon: '💵', type: 'income', color: '#78716c' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoriesByType(type: 'income' | 'expense'): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
