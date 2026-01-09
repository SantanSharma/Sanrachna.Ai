import { Injectable, inject, signal, computed } from '@angular/core';
import { FamilyMember, DEFAULT_FAMILY_MEMBER } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private storage = inject(StorageService);
  private readonly STORAGE_KEY = 'family_members';

  private membersSignal = signal<FamilyMember[]>([]);

  readonly members = this.membersSignal.asReadonly();
  readonly count = computed(() => this.membersSignal().length);

  constructor() {
    this.loadMembers();
  }

  private loadMembers(): void {
    const stored = this.storage.load<FamilyMember[]>(this.STORAGE_KEY, []);
    this.membersSignal.set(stored);
  }

  private saveMembers(): void {
    this.storage.save(this.STORAGE_KEY, this.membersSignal());
  }

  getAll(): FamilyMember[] {
    return this.membersSignal();
  }

  getById(id: string): FamilyMember | undefined {
    return this.membersSignal().find(m => m.id === id);
  }

  add(member: Partial<FamilyMember>): FamilyMember {
    const now = this.storage.getTimestamp();
    const newMember: FamilyMember = {
      ...DEFAULT_FAMILY_MEMBER,
      ...member,
      id: this.storage.generateId(),
      createdAt: now,
      updatedAt: now
    };

    this.membersSignal.update(members => [...members, newMember]);
    this.saveMembers();

    return newMember;
  }

  update(id: string, updates: Partial<FamilyMember>): FamilyMember | null {
    const member = this.getById(id);
    if (!member) return null;

    const updated: FamilyMember = {
      ...member,
      ...updates,
      id,
      updatedAt: this.storage.getTimestamp()
    };

    this.membersSignal.update(members =>
      members.map(m => m.id === id ? updated : m)
    );
    this.saveMembers();

    return updated;
  }

  delete(id: string): boolean {
    const exists = this.getById(id);
    if (!exists) return false;

    this.membersSignal.update(members => members.filter(m => m.id !== id));
    this.saveMembers();

    return true;
  }

  /**
   * Get members organized in hierarchy
   */
  getHierarchy(): FamilyMember[] {
    const members = this.membersSignal();

    // Priority order for relationships
    const priority: Record<string, number> = {
      'Grandfather': 1,
      'Grandmother': 2,
      'Father': 3,
      'Mother': 4,
      'Uncle': 5,
      'Aunt': 6,
      'Spouse': 7,
      'Brother': 8,
      'Sister': 9,
      'Son': 10,
      'Daughter': 11,
      'Cousin': 12,
      'Other': 13
    };

    return [...members].sort((a, b) =>
      (priority[a.relationship] || 99) - (priority[b.relationship] || 99)
    );
  }

  clearAll(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.membersSignal.set([]);
  }
}
