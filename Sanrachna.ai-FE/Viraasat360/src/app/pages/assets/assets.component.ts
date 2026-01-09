import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssetService } from '../../services';
import {
  Asset,
  ImmovableAsset,
  MovableAsset,
  AssetCategory,
  IMMOVABLE_ASSET_TYPES,
  MOVABLE_ASSET_TYPES,
  OWNERSHIP_TYPES,
  BANK_ACCOUNT_TYPES,
  ImmovableAssetType,
  MovableAssetType,
  OwnershipType
} from '../../models';
import { ModalComponent, ConfirmDialogComponent, EmptyStateComponent, StatCardComponent } from '../../shared';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyPipe,
    ModalComponent, ConfirmDialogComponent, EmptyStateComponent, StatCardComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">My Assets</h1>
          <p class="text-slate-400">Track all your immovable and movable assets</p>
        </div>
        <button
          (click)="openAddModal()"
          class="flex items-center justify-center gap-2 px-5 py-3 bg-app-600 hover:bg-app-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Asset
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <app-stat-card
          title="Immovable Assets"
          [value]="totalImmovable()"
          [isCurrency]="true"
          [subtitle]="immovableAssets().length + ' properties'"
          iconBgClass="bg-purple-500/20"
        >
          <svg icon class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Movable Assets"
          [value]="totalMovable()"
          [isCurrency]="true"
          [subtitle]="movableAssets().length + ' items'"
          iconBgClass="bg-blue-500/20"
        >
          <svg icon class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Total Assets"
          [value]="totalValue()"
          [isCurrency]="true"
          iconBgClass="bg-green-500/20"
        >
          <svg icon class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </app-stat-card>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-slate-700">
        <button
          (click)="activeTab.set('all')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          [ngClass]="activeTab() === 'all' ? 'border-app-500 text-app-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          All ({{ assets().length }})
        </button>
        <button
          (click)="activeTab.set('immovable')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          [ngClass]="activeTab() === 'immovable' ? 'border-app-500 text-app-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          Immovable ({{ immovableAssets().length }})
        </button>
        <button
          (click)="activeTab.set('movable')"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          [ngClass]="activeTab() === 'movable' ? 'border-app-500 text-app-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          Movable ({{ movableAssets().length }})
        </button>
      </div>

      <!-- Assets List -->
      @if (filteredAssets().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (asset of filteredAssets(); track asset.id) {
            <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors group">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                       [ngClass]="asset.category === 'immovable' ? 'bg-purple-500/20' : 'bg-blue-500/20'">
                    @if (asset.category === 'immovable') {
                      <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    } @else {
                      <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-white">{{ asset.name }}</h3>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <span class="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
                        {{ getAssetType(asset) }}
                      </span>
                      <span class="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
                        {{ asset.ownershipType }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    (click)="openEditModal(asset)"
                    class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    (click)="confirmDelete(asset)"
                    class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Value -->
              <div class="flex items-end justify-between">
                <div>
                  @if (asset.category === 'immovable' && $any(asset).location) {
                    <p class="text-sm text-slate-400 mb-1">
                      <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {{ $any(asset).location }}
                    </p>
                  }
                  @if (asset.category === 'movable' && $any(asset).bankName) {
                    <p class="text-sm text-slate-400 mb-1">{{ $any(asset).bankName }}</p>
                  }
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-white">{{ asset.value | currency:'INR':'symbol':'1.0-0' }}</p>
                  @if (asset.sharePercentage < 100) {
                    <p class="text-xs text-slate-500">{{ asset.sharePercentage }}% ownership</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          title="No assets yet"
          message="Start tracking your wealth by adding your first asset."
        >
          <svg icon class="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <button action (click)="openAddModal()" class="px-5 py-2.5 bg-app-600 hover:bg-app-700 text-white rounded-lg font-medium transition-colors">
            Add Asset
          </button>
        </app-empty-state>
      }

      <!-- Add/Edit Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingAsset() ? 'Edit Asset' : 'Add Asset'"
        size="lg"
        (closed)="closeModal()"
      >
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Category Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-3">Asset Category *</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                (click)="setCategory('immovable')"
                class="p-4 rounded-xl border-2 text-left transition-colors"
                [ngClass]="selectedCategory() === 'immovable' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'"
              >
                <svg class="w-8 h-8 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="font-medium text-white">Immovable</p>
                <p class="text-xs text-slate-400">Property, Land, House</p>
              </button>
              <button
                type="button"
                (click)="setCategory('movable')"
                class="p-4 rounded-xl border-2 text-left transition-colors"
                [ngClass]="selectedCategory() === 'movable' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'"
              >
                <svg class="w-8 h-8 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="font-medium text-white">Movable</p>
                <p class="text-xs text-slate-400">Bank, Stocks, Gold</p>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Asset Name *</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="e.g. Home in Mumbai"
              />
            </div>

            <!-- Asset Type -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Asset Type *</label>
              <select
                formControlName="assetType"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              >
                @for (type of getAssetTypes(); track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select>
            </div>

            <!-- Value -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Value (₹) *</label>
              <input
                type="number"
                formControlName="value"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="0"
              />
            </div>

            <!-- Ownership Type -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Ownership Type</label>
              <select
                formControlName="ownershipType"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              >
                @for (type of ownershipTypes; track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select>
            </div>

            <!-- Share Percentage -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Ownership Share (%)</label>
              <input
                type="number"
                formControlName="sharePercentage"
                min="1"
                max="100"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
              />
            </div>

            <!-- Location (Immovable only) -->
            @if (selectedCategory() === 'immovable') {
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  formControlName="location"
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                  placeholder="City, State"
                />
              </div>
            }

            <!-- Bank Name (Movable - Bank/FD) -->
            @if (selectedCategory() === 'movable' && showBankFields()) {
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Bank Name</label>
                <input
                  type="text"
                  formControlName="bankName"
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
            }

            <!-- Platform (Stocks/MF) -->
            @if (selectedCategory() === 'movable' && showPlatformField()) {
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                <input
                  type="text"
                  formControlName="platform"
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                  placeholder="e.g. Zerodha, Groww"
                />
              </div>
            }

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
              {{ editingAsset() ? 'Update' : 'Add' }} Asset
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Delete Confirmation -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete Asset"
        [message]="'Are you sure you want to delete ' + (deletingAsset()?.name || '') + '?'"
        confirmText="Delete"
        type="danger"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="closeDeleteDialog()"
      ></app-confirm-dialog>
    </div>
  `
})
export class AssetsComponent {
  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);

  assets = this.assetService.assets;
  immovableAssets = this.assetService.immovableAssets;
  movableAssets = this.assetService.movableAssets;
  totalImmovable = this.assetService.totalImmovableValue;
  totalMovable = this.assetService.totalMovableValue;
  totalValue = this.assetService.totalValue;

  ownershipTypes = OWNERSHIP_TYPES;

  form!: FormGroup;
  activeTab = signal<'all' | 'immovable' | 'movable'>('all');
  isModalOpen = signal(false);
  selectedCategory = signal<AssetCategory>('immovable');
  editingAsset = signal<Asset | null>(null);
  isDeleteDialogOpen = signal(false);
  deletingAsset = signal<Asset | null>(null);

  filteredAssets = computed(() => {
    const tab = this.activeTab();
    if (tab === 'immovable') return this.immovableAssets();
    if (tab === 'movable') return this.movableAssets();
    return this.assets();
  });

  showBankFields = computed(() => {
    const type = this.form?.get('assetType')?.value;
    return ['Bank Account', 'Fixed Deposit'].includes(type);
  });

  showPlatformField = computed(() => {
    const type = this.form?.get('assetType')?.value;
    return ['Stocks', 'Mutual Funds', 'Cryptocurrency'].includes(type);
  });

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      assetType: ['House', Validators.required],
      value: [0, [Validators.required, Validators.min(1)]],
      ownershipType: ['Self'],
      sharePercentage: [100, [Validators.min(1), Validators.max(100)]],
      location: [''],
      bankName: [''],
      platform: [''],
      notes: ['']
    });

    // Watch assetType changes to update computed signals
    this.form.get('assetType')?.valueChanges.subscribe(() => {
      // Trigger recomputation
    });
  }

  getAssetTypes(): string[] {
    return this.selectedCategory() === 'immovable' ? IMMOVABLE_ASSET_TYPES : MOVABLE_ASSET_TYPES;
  }

  setCategory(category: AssetCategory): void {
    this.selectedCategory.set(category);
    const defaultType = category === 'immovable' ? 'House' : 'Bank Account';
    this.form.patchValue({ assetType: defaultType });
  }

  getAssetType(asset: Asset): string {
    return 'assetType' in asset ? asset.assetType : 'Unknown';
  }

  openAddModal(): void {
    this.editingAsset.set(null);
    this.selectedCategory.set('immovable');
    this.form.reset({
      assetType: 'House',
      ownershipType: 'Self',
      sharePercentage: 100,
      value: 0
    });
    this.isModalOpen.set(true);
  }

  openEditModal(asset: Asset): void {
    this.editingAsset.set(asset);
    this.selectedCategory.set(asset.category);
    this.form.patchValue({
      name: asset.name,
      assetType: 'assetType' in asset ? asset.assetType : '',
      value: asset.value,
      ownershipType: asset.ownershipType,
      sharePercentage: asset.sharePercentage,
      location: asset.category === 'immovable' ? (asset as ImmovableAsset).location : '',
      bankName: asset.category === 'movable' ? (asset as MovableAsset).bankName : '',
      platform: asset.category === 'movable' ? (asset as MovableAsset).platform : '',
      notes: asset.notes
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingAsset.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const category = this.selectedCategory();

    if (this.editingAsset()) {
      this.assetService.update(this.editingAsset()!.id, {
        ...formValue,
        category
      });
    } else {
      if (category === 'immovable') {
        this.assetService.addImmovable(formValue);
      } else {
        this.assetService.addMovable(formValue);
      }
    }

    this.closeModal();
  }

  confirmDelete(asset: Asset): void {
    this.deletingAsset.set(asset);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.deletingAsset.set(null);
  }

  onDeleteConfirmed(): void {
    if (this.deletingAsset()) {
      this.assetService.delete(this.deletingAsset()!.id);
    }
    this.closeDeleteDialog();
  }
}
