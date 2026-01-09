import { Injectable, inject, signal, computed } from '@angular/core';
import { UserProfile, DEFAULT_USER_PROFILE } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private storage = inject(StorageService);
  private readonly STORAGE_KEY = 'user_profile';

  private profileSignal = signal<UserProfile | null>(null);

  readonly profile = this.profileSignal.asReadonly();
  readonly hasProfile = computed(() => !!this.profileSignal()?.fullName);

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    const stored = this.storage.load<UserProfile | null>(this.STORAGE_KEY, null);
    if (stored) {
      this.profileSignal.set(stored);
    }
  }

  getProfile(): UserProfile | null {
    return this.profileSignal();
  }

  saveProfile(profile: Partial<UserProfile>): UserProfile {
    const existing = this.profileSignal();
    const now = this.storage.getTimestamp();

    const updated: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      ...existing,
      ...profile,
      id: existing?.id || this.storage.generateId(),
      annualSalary: (profile.monthlySalary ?? existing?.monthlySalary ?? 0) * 12,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    this.storage.save(this.STORAGE_KEY, updated);
    this.profileSignal.set(updated);

    return updated;
  }

  clearProfile(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.profileSignal.set(null);
  }
}
