import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Asset,
  ImmovableAsset,
  MovableAsset,
  DEFAULT_IMMOVABLE_ASSET,
  DEFAULT_MOVABLE_ASSET
} from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private storage = inject(StorageService);
  private readonly STORAGE_KEY = 'assets';

  private assetsSignal = signal<Asset[]>([]);

  readonly assets = this.assetsSignal.asReadonly();

  readonly immovableAssets = computed(() =>
    this.assetsSignal().filter((a): a is ImmovableAsset => a.category === 'immovable')
  );

  readonly movableAssets = computed(() =>
    this.assetsSignal().filter((a): a is MovableAsset => a.category === 'movable')
  );

  readonly totalImmovableValue = computed(() =>
    this.immovableAssets().reduce((sum, a) => sum + (a.value * a.sharePercentage / 100), 0)
  );

  readonly totalMovableValue = computed(() =>
    this.movableAssets().reduce((sum, a) => sum + (a.value * a.sharePercentage / 100), 0)
  );

  readonly totalValue = computed(() =>
    this.totalImmovableValue() + this.totalMovableValue()
  );

  constructor() {
    this.loadAssets();
  }

  private loadAssets(): void {
    const stored = this.storage.load<Asset[]>(this.STORAGE_KEY, []);
    this.assetsSignal.set(stored);
  }

  private saveAssets(): void {
    this.storage.save(this.STORAGE_KEY, this.assetsSignal());
  }

  getAll(): Asset[] {
    return this.assetsSignal();
  }

  getById(id: string): Asset | undefined {
    return this.assetsSignal().find(a => a.id === id);
  }

  addImmovable(asset: Partial<ImmovableAsset>): ImmovableAsset {
    const now = this.storage.getTimestamp();
    const newAsset: ImmovableAsset = {
      ...DEFAULT_IMMOVABLE_ASSET,
      ...asset,
      id: this.storage.generateId(),
      category: 'immovable',
      createdAt: now,
      updatedAt: now
    };

    this.assetsSignal.update(assets => [...assets, newAsset]);
    this.saveAssets();

    return newAsset;
  }

  addMovable(asset: Partial<MovableAsset>): MovableAsset {
    const now = this.storage.getTimestamp();
    const newAsset: MovableAsset = {
      ...DEFAULT_MOVABLE_ASSET,
      ...asset,
      id: this.storage.generateId(),
      category: 'movable',
      createdAt: now,
      updatedAt: now
    };

    this.assetsSignal.update(assets => [...assets, newAsset]);
    this.saveAssets();

    return newAsset;
  }

  update(id: string, updates: Partial<Asset>): Asset | null {
    const asset = this.getById(id);
    if (!asset) return null;

    const updated: Asset = {
      ...asset,
      ...updates,
      id,
      updatedAt: this.storage.getTimestamp()
    } as Asset;

    this.assetsSignal.update(assets =>
      assets.map(a => a.id === id ? updated : a)
    );
    this.saveAssets();

    return updated;
  }

  delete(id: string): boolean {
    const exists = this.getById(id);
    if (!exists) return false;

    this.assetsSignal.update(assets => assets.filter(a => a.id !== id));
    this.saveAssets();

    return true;
  }

  /**
   * Get top N assets by value
   */
  getTopAssets(count: number = 3): Asset[] {
    return [...this.assetsSignal()]
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  }

  /**
   * Get asset distribution by type
   */
  getDistribution(): { category: string; value: number; percentage: number }[] {
    const total = this.totalValue();
    if (total === 0) return [];

    const immovable = this.totalImmovableValue();
    const movable = this.totalMovableValue();

    return [
      { category: 'Immovable', value: immovable, percentage: (immovable / total) * 100 },
      { category: 'Movable', value: movable, percentage: (movable / total) * 100 }
    ];
  }

  clearAll(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.assetsSignal.set([]);
  }
}
