import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LiabilityService } from '../../services';
import { Liability, LIABILITY_TYPES, LiabilityType, LiabilityStatus } from '../../models';
import { ModalComponent, ConfirmDialogComponent, EmptyStateComponent, StatCardComponent } from '../../shared';

@Component({
  selector: 'app-liabilities',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, PercentPipe,
    ModalComponent, ConfirmDialogComponent, EmptyStateComponent, StatCardComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">My Liabilities</h1>
          <p class="text-slate-400">Track your loans and obligations</p>
        </div>
        <button
          (click)="openAddModal()"
          class="flex items-center justify-center gap-2 px-5 py-3 bg-app-600 hover:bg-app-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Liability
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <app-stat-card
          title="Total Outstanding"
          [value]="totalOutstanding()"
          [isCurrency]="true"
          iconBgClass="bg-red-500/20"
        >
          <svg icon class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Monthly EMI Total"
          [value]="totalEmi()"
          [isCurrency]="true"
          iconBgClass="bg-orange-500/20"
        >
          <svg icon class="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Active Loans"
          [value]="activeCount()"
          [subtitle]="'of ' + liabilities().length + ' total'"
          iconBgClass="bg-blue-500/20"
        >
          <svg icon class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </app-stat-card>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
        <button
          (click)="activeTab.set('all')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          [ngClass]="activeTab() === 'all' ? 'border-app-500 text-app-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          All ({{ liabilities().length }})
        </button>
        <button
          (click)="activeTab.set('active')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          [ngClass]="activeTab() === 'active' ? 'border-app-500 text-app-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          Active ({{ activeCount() }})
        </button>
        <button
          (click)="activeTab.set('closed')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          [ngClass]="activeTab() === 'closed' ? 'border-app-500 text-app-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          Closed ({{ closedCount() }})
        </button>
      </div>

      <!-- Liabilities List -->
      @if (filteredLiabilities().length > 0) {
        <div class="space-y-4">
          @for (liability of filteredLiabilities(); track liability.id) {
            <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors group">
              <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <!-- Left: Info -->
                <div class="flex items-start gap-4 flex-1">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                       [ngClass]="getTypeIconBg(liability.type)">
                    <svg class="w-6 h-6" [ngClass]="getTypeIconColor(liability.type)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      @switch (liability.type) {
                        @case ('Home Loan') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        }
                        @case ('Car Loan') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                        @case ('Credit Card') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        }
                        @default {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        }
                      }
                    </svg>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="text-lg font-semibold text-white">{{ liability.name }}</h3>
                      <span class="px-2 py-0.5 text-xs rounded-full"
                            [ngClass]="getStatusClass(liability.status)">
                        {{ liability.status }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                      <span>{{ liability.type }}</span>
                      @if (liability.lenderName) {
                        <span>{{ liability.lenderName }}</span>
                      }
                      <span>&#64; {{ liability.interestRate }}% p.a.</span>
                    </div>
                  </div>
                </div>

                <!-- Center: Progress -->
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-slate-500">Repayment Progress</span>
                    <span class="text-xs text-slate-400">
                      {{ getRepaymentPercentage(liability) | percent:'1.0-0' }}
                    </span>
                  </div>
                  <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-app-500 to-accent-500 transition-all"
                      [style.width.%]="getRepaymentPercentage(liability) * 100"
                    ></div>
                  </div>
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-slate-500">Paid: {{ liability.principalAmount - liability.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</span>
                    <span class="text-xs text-slate-500">Total: {{ liability.principalAmount | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <!-- Right: EMI & Actions -->
                <div class="flex items-center gap-4 lg:ml-4">
                  <div class="text-right">
                    <p class="text-xs text-slate-500 mb-1">Monthly EMI</p>
                    <p class="text-xl font-bold text-white">{{ liability.emi | currency:'INR':'symbol':'1.0-0' }}</p>
                    <p class="text-xs text-slate-400">Outstanding: {{ liability.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}</p>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      (click)="openEditModal(liability)"
                      class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      (click)="confirmDelete(liability)"
                      class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          title="No liabilities recorded"
          message="Add your loans and debts to track repayment progress."
        >
          <svg icon class="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <button action (click)="openAddModal()" class="px-5 py-2.5 bg-app-600 hover:bg-app-700 text-white rounded-lg font-medium transition-colors">
            Add Liability
          </button>
        </app-empty-state>
      }

      <!-- Add/Edit Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingLiability() ? 'Edit Liability' : 'Add Liability'"
        size="lg"
        (closed)="closeModal()"
      >
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Liability Name *</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="e.g. Home Loan - HDFC"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Liability Type *</label>
              <select
                formControlName="type"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              >
                @for (type of liabilityTypes; track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select>
            </div>

            <!-- Lender -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Lender/Bank</label>
              <input
                type="text"
                formControlName="lenderName"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="e.g. HDFC Bank"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                formControlName="status"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Defaulted">Defaulted</option>
              </select>
            </div>

            <!-- Principal Amount -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Principal Amount (₹) *</label>
              <input
                type="number"
                formControlName="principalAmount"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="0"
              />
            </div>

            <!-- Outstanding Amount -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Outstanding Amount (₹) *</label>
              <input
                type="number"
                formControlName="outstandingAmount"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="0"
              />
            </div>

            <!-- Interest Rate -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Interest Rate (% p.a.) *</label>
              <input
                type="number"
                step="0.01"
                formControlName="interestRate"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="e.g. 8.5"
              />
            </div>

            <!-- EMI Amount -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">EMI Amount (₹)</label>
              <input
                type="number"
                formControlName="emi"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="0"
              />
            </div>

            <!-- Start Date -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                formControlName="startDate"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              />
            </div>

            <!-- End Date -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">End Date</label>
              <input
                type="date"
                formControlName="endDate"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              />
            </div>

            <!-- Notes -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                formControlName="notes"
                rows="2"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 resize-none"
                placeholder="Any additional notes"
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              (click)="closeModal()"
              class="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-app-600 hover:bg-app-700 disabled:opacity-50 transition-colors"
            >
              {{ editingLiability() ? 'Update' : 'Add' }} Liability
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Delete Confirmation -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete Liability"
        [message]="'Are you sure you want to delete ' + (deletingLiability()?.name || '') + '?'"
        confirmText="Delete"
        type="danger"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="closeDeleteDialog()"
      ></app-confirm-dialog>
    </div>
  `
})
export class LiabilitiesComponent {
  private fb = inject(FormBuilder);
  private liabilityService = inject(LiabilityService);

  liabilities = this.liabilityService.liabilities;
  totalOutstanding = this.liabilityService.totalOutstanding;
  totalEmi = this.liabilityService.totalEmi;
  liabilityTypes = LIABILITY_TYPES;

  form!: FormGroup;
  activeTab = signal<'all' | 'active' | 'closed'>('all');
  isModalOpen = signal(false);
  editingLiability = signal<Liability | null>(null);
  isDeleteDialogOpen = signal(false);
  deletingLiability = signal<Liability | null>(null);

  activeCount = computed(() => 
    this.liabilities().filter(l => l.status === 'Active').length
  );

  closedCount = computed(() => 
    this.liabilities().filter(l => l.status === 'Closed').length
  );

  filteredLiabilities = computed(() => {
    const tab = this.activeTab();
    if (tab === 'active') return this.liabilities().filter(l => l.status === 'Active');
    if (tab === 'closed') return this.liabilities().filter(l => l.status === 'Closed');
    return this.liabilities();
  });

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['Personal Loan', Validators.required],
      lenderName: [''],
      status: ['Active'],
      principalAmount: [0, [Validators.required, Validators.min(1)]],
      outstandingAmount: [0, [Validators.required, Validators.min(0)]],
      interestRate: [0, [Validators.required, Validators.min(0)]],
      emi: [0],
      startDate: [''],
      endDate: [''],
      notes: ['']
    });
  }

  getRepaymentPercentage(liability: Liability): number {
    if (liability.principalAmount === 0) return 0;
    return (liability.principalAmount - liability.outstandingAmount) / liability.principalAmount;
  }

  getTypeIconBg(type: LiabilityType): string {
    const bgMap: Record<string, string> = {
      'Home Loan': 'bg-purple-500/20',
      'Car Loan': 'bg-blue-500/20',
      'Personal Loan': 'bg-yellow-500/20',
      'Education Loan': 'bg-green-500/20',
      'Credit Card': 'bg-red-500/20',
      'Gold Loan': 'bg-amber-500/20',
      'Business Loan': 'bg-cyan-500/20',
      'Other': 'bg-slate-500/20'
    };
    return bgMap[type] || 'bg-slate-500/20';
  }

  getTypeIconColor(type: LiabilityType): string {
    const colorMap: Record<string, string> = {
      'Home Loan': 'text-purple-400',
      'Car Loan': 'text-blue-400',
      'Personal Loan': 'text-yellow-400',
      'Education Loan': 'text-green-400',
      'Credit Card': 'text-red-400',
      'Gold Loan': 'text-amber-400',
      'Business Loan': 'text-cyan-400',
      'Other': 'text-slate-400'
    };
    return colorMap[type] || 'text-slate-400';
  }

  getStatusClass(status: LiabilityStatus): string {
    const statusMap: Record<LiabilityStatus, string> = {
      'Active': 'bg-green-500/20 text-green-400',
      'Closed': 'bg-slate-500/20 text-slate-400',
      'Defaulted': 'bg-red-500/20 text-red-400'
    };
    return statusMap[status];
  }

  openAddModal(): void {
    this.editingLiability.set(null);
    this.form.reset({
      type: 'Personal Loan',
      status: 'Active',
      principalAmount: 0,
      outstandingAmount: 0,
      interestRate: 0,
      emi: 0
    });
    this.isModalOpen.set(true);
  }

  openEditModal(liability: Liability): void {
    this.editingLiability.set(liability);
    this.form.patchValue({
      name: liability.name,
      type: liability.type,
      lenderName: liability.lenderName,
      status: liability.status,
      principalAmount: liability.principalAmount,
      outstandingAmount: liability.outstandingAmount,
      interestRate: liability.interestRate,
      emi: liability.emi,
      startDate: liability.startDate,
      endDate: liability.endDate,
      notes: liability.notes
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingLiability.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.editingLiability()) {
      this.liabilityService.update(this.editingLiability()!.id, formValue);
    } else {
      this.liabilityService.add(formValue);
    }

    this.closeModal();
  }

  confirmDelete(liability: Liability): void {
    this.deletingLiability.set(liability);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.deletingLiability.set(null);
  }

  onDeleteConfirmed(): void {
    if (this.deletingLiability()) {
      this.liabilityService.delete(this.deletingLiability()!.id);
    }
    this.closeDeleteDialog();
  }
}
