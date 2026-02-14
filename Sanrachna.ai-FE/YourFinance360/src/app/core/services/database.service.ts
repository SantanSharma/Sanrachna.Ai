import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { Budget } from '../models/budget.model';
import { Settings, DEFAULT_CURRENCY } from '../models/settings.model';

const DB_NAME = 'YourFinance360DB';
const DB_VERSION = 1;

interface DBSchema {
  transactions: Transaction;
  budgets: Budget;
  settings: Settings;
}

type StoreName = keyof DBSchema;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.initDatabase();
  }

  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', {
            keyPath: 'id',
            autoIncrement: true
          });
          transactionStore.createIndex('type', 'type', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
          transactionStore.createIndex('date', 'date', { unique: false });
        }

        // Budgets store
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', {
            keyPath: 'id',
            autoIncrement: true
          });
          budgetStore.createIndex('year', 'year', { unique: false });
          budgetStore.createIndex('type', 'type', { unique: false });
          budgetStore.createIndex('year_month', ['year', 'month'], { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };
    });
  }

  private async getStore(storeName: StoreName, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.dbReady;
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic CRUD operations
  async add<T extends StoreName>(storeName: T, data: DBSchema[T]): Promise<number> {
    const store = await this.getStore(storeName, 'readwrite');
    const now = new Date().toISOString();
    const dataWithTimestamp = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    return new Promise((resolve, reject) => {
      const request = store.add(dataWithTimestamp);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T extends StoreName>(storeName: T, data: DBSchema[T]): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(dataWithTimestamp);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete<T extends StoreName>(storeName: T, id: number): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T extends StoreName>(storeName: T, id: number): Promise<DBSchema[T] | undefined> {
    const store = await this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T extends StoreName>(storeName: T): Promise<DBSchema[T][]> {
    const store = await this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T extends StoreName>(
    storeName: T,
    indexName: string,
    value: IDBValidKey | IDBKeyRange
  ): Promise<DBSchema[T][]> {
    const store = await this.getStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear<T extends StoreName>(storeName: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings specific methods
  async getSettings(): Promise<Settings> {
    const settings = await this.getAll<'settings'>('settings');
    if (settings.length === 0) {
      // Create default settings
      const defaultSettings: Settings = {
        currencyCode: DEFAULT_CURRENCY,
        theme: 'light'
      };
      const id = await this.add('settings', defaultSettings);
      return { ...defaultSettings, id };
    }
    return settings[0];
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    await this.update('settings', { ...current, ...settings });
  }
}
