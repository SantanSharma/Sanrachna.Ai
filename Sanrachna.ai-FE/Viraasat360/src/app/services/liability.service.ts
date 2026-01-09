import { Injectable, inject, signal, computed } from '@angular/core';
import { Liability, DEFAULT_LIABILITY } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LiabilityService {
  private storage = inject(StorageService);
  private readonly STORAGE_KEY = 'liabilities';

  private liabilitiesSignal = signal<Liability[]>([]);

  readonly liabilities = this.liabilitiesSignal.asReadonly();
  readonly count = computed(() => this.liabilitiesSignal().length);

  readonly totalOutstanding = computed(() =>
    this.liabilitiesSignal().reduce((sum, l) => sum + l.outstandingAmount, 0)
  );

  readonly totalEmi = computed(() =>
    this.liabilitiesSignal().reduce((sum, l) => sum + l.emi, 0)
  );

  constructor() {
    this.loadLiabilities();
  }

  private loadLiabilities(): void {
    const stored = this.storage.load<Liability[]>(this.STORAGE_KEY, []);
    this.liabilitiesSignal.set(stored);
  }

  private saveLiabilities(): void {
    this.storage.save(this.STORAGE_KEY, this.liabilitiesSignal());
  }

  getAll(): Liability[] {
    return this.liabilitiesSignal();
  }

  getById(id: string): Liability | undefined {
    return this.liabilitiesSignal().find(l => l.id === id);
  }

  add(liability: Partial<Liability>): Liability {
    const now = this.storage.getTimestamp();
    const newLiability: Liability = {
      ...DEFAULT_LIABILITY,
      ...liability,
      id: this.storage.generateId(),
      createdAt: now,
      updatedAt: now
    };

    this.liabilitiesSignal.update(liabilities => [...liabilities, newLiability]);
    this.saveLiabilities();

    return newLiability;
  }

  update(id: string, updates: Partial<Liability>): Liability | null {
    const liability = this.getById(id);
    if (!liability) return null;

    const updated: Liability = {
      ...liability,
      ...updates,
      id,
      updatedAt: this.storage.getTimestamp()
    };

    this.liabilitiesSignal.update(liabilities =>
      liabilities.map(l => l.id === id ? updated : l)
    );
    this.saveLiabilities();

    return updated;
  }

  delete(id: string): boolean {
    const exists = this.getById(id);
    if (!exists) return false;

    this.liabilitiesSignal.update(liabilities => liabilities.filter(l => l.id !== id));
    this.saveLiabilities();

    return true;
  }

  /**
   * Get the biggest liability by outstanding amount
   */
  getBiggest(): Liability | null {
    const liabilities = this.liabilitiesSignal();
    if (liabilities.length === 0) return null;

    return liabilities.reduce((max, l) =>
      l.outstandingAmount > max.outstandingAmount ? l : max
    );
  }

  /**
   * Get liability distribution by type
   */
  getDistribution(): { category: string; value: number; percentage: number }[] {
    const total = this.totalOutstanding();
    if (total === 0) return [];

    const byType = this.liabilitiesSignal().reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + l.outstandingAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byType).map(([category, value]) => ({
      category,
      value,
      percentage: (value / total) * 100
    }));
  }

  clearAll(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.liabilitiesSignal.set([]);
  }
}
