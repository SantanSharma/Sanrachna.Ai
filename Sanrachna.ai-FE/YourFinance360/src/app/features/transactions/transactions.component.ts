import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService, SettingsService } from '../../core/services';
import { Transaction, TransactionType } from '../../core/models/transaction.model';
import { getCategoriesByType, getCategoryById, Category } from '../../core/models/category.model';
import { ModalComponent, ConfirmDialogComponent, EmptyStateComponent } from '../../shared/components';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    CurrencyPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Transactions</h1>
          <p class="text-gray-400">Track your income and expenses</p>
        </div>
        <button
          (click)="openAddModal()"
          class="btn btn-primary flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Transaction
        </button>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              [(ngModel)]="filterType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              [(ngModel)]="filterCategory"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <optgroup label="Expenses">
                <option *ngFor="let cat of expenseCategories" [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
              </optgroup>
              <optgroup label="Income">
                <option *ngFor="let cat of incomeCategories" [value]="cat.id">{{ cat.icon }} {{ cat.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Date Range</label>
            <select
              [(ngModel)]="filterDateRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-gradient-to-br from-success-900/50 to-success-800/30 border border-success-700/30">
          <p class="text-sm text-success-400 font-medium">Total Income</p>
          <p class="text-2xl font-bold text-success-400">{{ filteredSummary().income | currency }}</p>
        </div>
        <div class="card bg-gradient-to-br from-danger-900/50 to-danger-800/30 border border-danger-700/30">
          <p class="text-sm text-danger-400 font-medium">Total Expenses</p>
          <p class="text-2xl font-bold text-danger-400">{{ filteredSummary().expenses | currency }}</p>
        </div>
        <div class="card bg-gradient-to-br from-primary-900/50 to-primary-800/30 border border-primary-700/30">
          <p class="text-sm text-primary-400 font-medium">Net Balance</p>
          <p
            class="text-2xl font-bold"
            [ngClass]="filteredSummary().balance >= 0 ? 'text-success-400' : 'text-danger-400'"
          >
            {{ filteredSummary().balance | currency }}
          </p>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="card">
        <div *ngIf="filteredTransactions().length === 0">
          <app-empty-state
            icon="💰"
            title="No transactions found"
            message="Add your first transaction to start tracking your finances."
          >
            <button (click)="openAddModal()" class="btn btn-primary">
              Add Transaction
            </button>
          </app-empty-state>
        </div>

        <div *ngIf="filteredTransactions().length > 0" class="space-y-2">
          <div
            *ngFor="let transaction of filteredTransactions(); trackBy: trackByFn"
            class="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                [ngClass]="transaction.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20'"
              >
                {{ getCategoryIcon(transaction.category) }}
              </div>
              <div>
                <p class="font-semibold text-white">{{ getCategoryName(transaction.category) }}</p>
                <p class="text-sm text-gray-400">{{ transaction.date | date:'EEE, MMM d, y' }}</p>
                <p *ngIf="transaction.notes" class="text-xs text-gray-500 mt-1">{{ transaction.notes }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p
                  class="text-lg font-bold"
                  [ngClass]="transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'"
                >
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | currency }}
                </p>
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  [ngClass]="transaction.type === 'income' ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'"
                >
                  {{ transaction.type }}
                </span>
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  (click)="editTransaction(transaction)"
                  class="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  (click)="confirmDelete(transaction)"
                  class="p-2 text-gray-400 hover:text-danger-400 hover:bg-danger-500/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <app-modal
      [isOpen]="isModalOpen()"
      [title]="isEditing() ? 'Edit Transaction' : 'Add Transaction'"
      size="lg"
      (closed)="closeModal()"
    >
      <form [formGroup]="transactionForm" (ngSubmit)="saveTransaction()">
        <!-- Transaction Type -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              (click)="setTransactionType('expense')"
              class="p-4 rounded-xl border-2 transition-all"
              [ngClass]="transactionForm.get('type')?.value === 'expense'
                ? 'border-danger-500 bg-danger-500/20'
                : 'border-gray-600 hover:border-gray-500'"
            >
              <span class="text-2xl block mb-1">💸</span>
              <span class="font-medium" [ngClass]="transactionForm.get('type')?.value === 'expense' ? 'text-danger-400' : 'text-gray-300'">Expense</span>
            </button>
            <button
              type="button"
              (click)="setTransactionType('income')"
              class="p-4 rounded-xl border-2 transition-all"
              [ngClass]="transactionForm.get('type')?.value === 'income'
                ? 'border-success-500 bg-success-500/20'
                : 'border-gray-600 hover:border-gray-500'"
            >
              <span class="text-2xl block mb-1">💰</span>
              <span class="font-medium" [ngClass]="transactionForm.get('type')?.value === 'income' ? 'text-success-400' : 'text-gray-300'">Income</span>
            </button>
          </div>
        </div>

        <!-- Amount -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Amount <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {{ settingsService.currencySymbol() }}
            </span>
            <input
              type="number"
              formControlName="amount"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
              min="0.01"
              step="0.01"
            >
          </div>
          <p *ngIf="transactionForm.get('amount')?.touched && transactionForm.get('amount')?.errors?.['required']"
             class="text-danger-500 text-sm mt-1">
            Amount is required
          </p>
          <p *ngIf="transactionForm.get('amount')?.touched && transactionForm.get('amount')?.errors?.['min']"
             class="text-danger-500 text-sm mt-1">
            Amount must be greater than 0
          </p>
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Category <span class="text-danger-500">*</span>
          </label>
          <div class="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
            <button
              type="button"
              *ngFor="let category of availableCategories()"
              (click)="selectCategory(category.id)"
              class="p-2 rounded-lg border-2 transition-all text-center"
              [ngClass]="transactionForm.get('category')?.value === category.id
                ? 'border-primary-500 bg-primary-500/20'
                : 'border-gray-600 hover:border-gray-500'"
            >
              <span class="text-xl block">{{ category.icon }}</span>
              <span class="text-xs text-gray-400 block truncate">{{ category.name }}</span>
            </button>
          </div>
          <p *ngIf="transactionForm.get('category')?.touched && transactionForm.get('category')?.errors?.['required']"
             class="text-danger-500 text-sm mt-1">
            Please select a category
          </p>
        </div>

        <!-- Date -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Date <span class="text-danger-500">*</span>
          </label>
          <input
            type="date"
            formControlName="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
          <p *ngIf="transactionForm.get('date')?.touched && transactionForm.get('date')?.errors?.['required']"
             class="text-danger-500 text-sm mt-1">
            Date is required
          </p>
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
          <textarea
            formControlName="notes"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="2"
            placeholder="Add a note..."
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <button type="button" (click)="closeModal()" class="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="transactionForm.invalid || isSaving()"
          >
            {{ isSaving() ? 'Saving...' : (isEditing() ? 'Update' : 'Add') }} Transaction
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Delete Confirmation -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen()"
      title="Delete Transaction"
      message="Are you sure you want to delete this transaction? This action cannot be undone."
      confirmText="Delete"
      icon="🗑️"
      variant="danger"
      (confirmed)="deleteTransaction()"
      (cancelled)="closeDeleteDialog()"
    />
  `,
  styles: []
})
export class TransactionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  transactionService = inject(TransactionService);
  settingsService = inject(SettingsService);

  // Filters
  filterType = 'all';
  filterCategory = 'all';
  filterDateRange = 'all';

  // Categories
  expenseCategories = getCategoriesByType('expense');
  incomeCategories = getCategoriesByType('income');

  // State
  isModalOpen = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);
  isDeleteDialogOpen = signal(false);
  transactionToDelete = signal<Transaction | null>(null);
  editingTransaction = signal<Transaction | null>(null);

  // Form
  transactionForm: FormGroup = this.fb.group({
    type: ['expense', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    date: [this.getTodayDate(), Validators.required],
    notes: ['']
  });

  availableCategories = computed(() => {
    const type = this.transactionForm.get('type')?.value as TransactionType;
    return getCategoriesByType(type);
  });

  filteredTransactions = computed(() => {
    let transactions = this.transactionService.transactions();

    // Filter by type
    if (this.filterType !== 'all') {
      transactions = transactions.filter(t => t.type === this.filterType);
    }

    // Filter by category
    if (this.filterCategory !== 'all') {
      transactions = transactions.filter(t => t.category === this.filterCategory);
    }

    // Filter by date range
    if (this.filterDateRange !== 'all') {
      const now = new Date();
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        switch (this.filterDateRange) {
          case 'today':
            return this.isSameDay(date, now);
          case 'week':
            return this.isThisWeek(date, now);
          case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          case 'year':
            return date.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return transactions;
  });

  filteredSummary = computed(() => {
    const transactions = this.filteredTransactions();
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses
    };
  });

  ngOnInit(): void {
    // Check query params for action
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'add') {
        this.openAddModal(params['type'] as TransactionType);
      }
    });

    // Listen for type changes to reset category
    this.transactionForm.get('type')?.valueChanges.subscribe(() => {
      this.transactionForm.patchValue({ category: '' });
    });
  }

  openAddModal(type?: TransactionType): void {
    this.isEditing.set(false);
    this.editingTransaction.set(null);
    this.transactionForm.reset({
      type: type || 'expense',
      amount: null,
      category: '',
      date: this.getTodayDate(),
      notes: ''
    });
    this.isModalOpen.set(true);

    // Clear query params
    this.router.navigate([], { queryParams: {} });
  }

  editTransaction(transaction: Transaction): void {
    this.isEditing.set(true);
    this.editingTransaction.set(transaction);
    this.transactionForm.patchValue({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: this.formatDateForInput(new Date(transaction.date)),
      notes: transaction.notes || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditing.set(false);
    this.editingTransaction.set(null);
  }

  async saveTransaction(): Promise<void> {
    if (this.transactionForm.invalid) return;

    this.isSaving.set(true);

    try {
      const formValue = this.transactionForm.value;
      const transactionData: Transaction = {
        type: formValue.type,
        amount: parseFloat(formValue.amount),
        category: formValue.category,
        date: formValue.date,
        notes: formValue.notes?.trim() || undefined
      };

      if (this.isEditing() && this.editingTransaction()) {
        await this.transactionService.updateTransaction({
          ...transactionData,
          id: this.editingTransaction()!.id
        });
      } else {
        await this.transactionService.addTransaction(transactionData);
      }

      this.closeModal();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  setTransactionType(type: TransactionType): void {
    this.transactionForm.patchValue({ type });
  }

  selectCategory(categoryId: string): void {
    this.transactionForm.patchValue({ category: categoryId });
  }

  confirmDelete(transaction: Transaction): void {
    this.transactionToDelete.set(transaction);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.transactionToDelete.set(null);
  }

  async deleteTransaction(): Promise<void> {
    const transaction = this.transactionToDelete();
    if (!transaction?.id) return;

    try {
      await this.transactionService.deleteTransaction(transaction.id);
      this.closeDeleteDialog();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  }

  getCategoryIcon(categoryId: string): string {
    return getCategoryById(categoryId)?.icon || '📦';
  }

  getCategoryName(categoryId: string): string {
    return getCategoryById(categoryId)?.name || categoryId;
  }

  trackByFn(index: number, item: Transaction): number {
    return item.id || index;
  }

  private getTodayDate(): string {
    return this.formatDateForInput(new Date());
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  private isThisWeek(date: Date, now: Date): boolean {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return date >= startOfWeek && date < endOfWeek;
  }
}
