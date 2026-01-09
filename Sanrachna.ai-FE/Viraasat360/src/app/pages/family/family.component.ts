import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FamilyService } from '../../services';
import { FamilyMember, RELATIONSHIP_OPTIONS, RelationshipType, DependencyStatus } from '../../models';
import { ModalComponent, ConfirmDialogComponent, EmptyStateComponent } from '../../shared';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">My Family</h1>
          <p class="text-slate-400">Manage your family members and relationships</p>
        </div>
        <button
          (click)="openAddModal()"
          class="flex items-center justify-center gap-2 px-5 py-3 bg-app-600 hover:bg-app-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Family Member
        </button>
      </div>

      <!-- Family Count -->
      @if (members().length > 0) {
        <div class="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ members().length }} family member{{ members().length !== 1 ? 's' : '' }}
        </div>
      }

      <!-- Family Hierarchy View -->
      @if (members().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (member of hierarchyMembers(); track member.id) {
            <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors group">
              <div class="flex items-start gap-4">
                <!-- Avatar -->
                <div class="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
                     [ngClass]="getRelationshipColor(member.relationship)">
                  {{ getInitials(member.name) }}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-white truncate">{{ member.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 text-xs rounded-full"
                          [ngClass]="getRelationshipBadgeClass(member.relationship)">
                      {{ member.relationship }}
                    </span>
                    <span class="px-2 py-0.5 text-xs rounded-full"
                          [ngClass]="member.dependencyStatus === 'Dependent' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'">
                      {{ member.dependencyStatus }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    (click)="openEditModal(member)"
                    class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    (click)="confirmDelete(member)"
                    class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="mt-4 space-y-2 text-sm">
                @if (member.email) {
                  <div class="flex items-center gap-2 text-slate-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="truncate">{{ member.email }}</span>
                  </div>
                }
                @if (member.phone) {
                  <div class="flex items-center gap-2 text-slate-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{{ member.phone }}</span>
                  </div>
                }
                @if (member.notes) {
                  <div class="flex items-start gap-2 text-slate-500 mt-3 pt-3 border-t border-slate-700">
                    <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span class="line-clamp-2">{{ member.notes }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <app-empty-state
          title="No family members yet"
          message="Start building your family tree by adding your first family member."
        >
          <svg icon class="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <button action (click)="openAddModal()" class="px-5 py-2.5 bg-app-600 hover:bg-app-700 text-white rounded-lg font-medium transition-colors">
            Add Family Member
          </button>
        </app-empty-state>
      }

      <!-- Add/Edit Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingMember() ? 'Edit Family Member' : 'Add Family Member'"
        size="lg"
        (closed)="closeModal()"
      >
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Name *</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="Enter name"
              />
            </div>

            <!-- Relationship -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Relationship *</label>
              <select
                formControlName="relationship"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              >
                @for (rel of relationshipOptions; track rel) {
                  <option [value]="rel">{{ rel }}</option>
                }
              </select>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="email@example.com"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
              <input
                type="date"
                formControlName="dateOfBirth"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              />
            </div>

            <!-- Dependency Status -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Dependency Status</label>
              <select
                formControlName="dependencyStatus"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500"
              >
                <option value="Independent">Independent</option>
                <option value="Dependent">Dependent</option>
              </select>
            </div>

            <!-- Notes -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                formControlName="notes"
                rows="3"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 resize-none"
                placeholder="Any additional notes (medical, financial relevance, etc.)"
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
              {{ editingMember() ? 'Update' : 'Add' }} Member
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Delete Confirmation -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete Family Member"
        [message]="'Are you sure you want to delete ' + (deletingMember()?.name || '') + '? This action cannot be undone.'"
        confirmText="Delete"
        type="danger"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="closeDeleteDialog()"
      ></app-confirm-dialog>
    </div>
  `
})
export class FamilyComponent {
  private fb = inject(FormBuilder);
  private familyService = inject(FamilyService);

  members = this.familyService.members;
  hierarchyMembers = this.familyService.getHierarchy.bind(this.familyService);
  relationshipOptions = RELATIONSHIP_OPTIONS;

  form!: FormGroup;
  isModalOpen = signal(false);
  editingMember = signal<FamilyMember | null>(null);
  isDeleteDialogOpen = signal(false);
  deletingMember = signal<FamilyMember | null>(null);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      relationship: ['Spouse', Validators.required],
      email: [''],
      phone: [''],
      dateOfBirth: [''],
      dependencyStatus: ['Independent'],
      notes: ['']
    });
  }

  openAddModal(): void {
    this.editingMember.set(null);
    this.form.reset({
      relationship: 'Spouse',
      dependencyStatus: 'Independent'
    });
    this.isModalOpen.set(true);
  }

  openEditModal(member: FamilyMember): void {
    this.editingMember.set(member);
    this.form.patchValue(member);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingMember.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.editingMember()) {
      this.familyService.update(this.editingMember()!.id, formValue);
    } else {
      this.familyService.add(formValue);
    }

    this.closeModal();
  }

  confirmDelete(member: FamilyMember): void {
    this.deletingMember.set(member);
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
    this.deletingMember.set(null);
  }

  onDeleteConfirmed(): void {
    if (this.deletingMember()) {
      this.familyService.delete(this.deletingMember()!.id);
    }
    this.closeDeleteDialog();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  getRelationshipColor(relationship: RelationshipType): string {
    const colors: Record<string, string> = {
      'Father': 'bg-blue-500/20 text-blue-400',
      'Mother': 'bg-pink-500/20 text-pink-400',
      'Spouse': 'bg-app-500/20 text-app-400',
      'Son': 'bg-green-500/20 text-green-400',
      'Daughter': 'bg-purple-500/20 text-purple-400',
      'Brother': 'bg-teal-500/20 text-teal-400',
      'Sister': 'bg-rose-500/20 text-rose-400',
      'Grandfather': 'bg-indigo-500/20 text-indigo-400',
      'Grandmother': 'bg-fuchsia-500/20 text-fuchsia-400',
    };
    return colors[relationship] || 'bg-slate-500/20 text-slate-400';
  }

  getRelationshipBadgeClass(relationship: RelationshipType): string {
    return this.getRelationshipColor(relationship);
  }
}
