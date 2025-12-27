import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, Role, AdminUserUpdateRequest, PaginatedResult } from '../../core/models';

interface EditableUser extends User {
  isEditing?: boolean;
}

interface EditFormData {
  userId: number;
  name: string;
  avatarUrl: string;
  roleId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="min-h-screen bg-gray-900">
      <!-- Header with Tabs -->
      <div class="sticky top-16 z-30 bg-gray-900 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-between py-4">
            <h1 class="text-xl md:text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          <!-- Tab Navigation - Works on all screen sizes -->
          <div class="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                [class]="activeTab() === tab.id 
                  ? 'flex items-center gap-2 px-4 py-3 text-indigo-400 border-b-2 border-indigo-400 font-medium whitespace-nowrap'
                  : 'flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-gray-200 border-b-2 border-transparent whitespace-nowrap'"
              >
                <span class="material-icons-outlined text-lg">{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-6">
        @if (activeTab() === 'users') {
          <div class="space-y-4 md:space-y-6">
            <!-- Action Bar -->
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-gray-400 text-sm">Manage all users in the system</p>
              <button
                (click)="loadUsers()"
                [disabled]="isLoading()"
                class="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-200 text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <span class="material-icons-outlined text-sm" [class.animate-spin]="isLoading()">refresh</span>
                <span class="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <!-- Stats Cards - Responsive grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              @for (stat of statsCards(); track stat.label) {
                <div class="bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-700">
                  <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center" [class]="stat.bgClass">
                      <span class="material-icons-outlined text-lg md:text-xl" [class]="stat.iconClass">{{ stat.icon }}</span>
                    </div>
                    <div>
                      <p class="text-xl md:text-2xl font-bold text-white">{{ stat.value }}</p>
                      <p class="text-xs text-gray-400">{{ stat.label }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Bulk Actions - Responsive -->
            @if (selectedUsers().length > 0) {
              <div class="bg-indigo-900/30 border border-indigo-500/50 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span class="text-indigo-200 text-sm">{{ selectedUsers().length }} user(s) selected</span>
                <div class="flex flex-wrap items-center gap-2">
                  <button (click)="bulkActivate()" class="px-3 py-1.5 bg-green-600 text-white text-xs md:text-sm rounded-lg hover:bg-green-500">
                    Activate
                  </button>
                  <button (click)="bulkDeactivate()" class="px-3 py-1.5 bg-red-600 text-white text-xs md:text-sm rounded-lg hover:bg-red-500">
                    Deactivate
                  </button>
                  <button (click)="clearSelection()" class="px-3 py-1.5 bg-gray-600 text-white text-xs md:text-sm rounded-lg hover:bg-gray-500">
                    Clear
                  </button>
                </div>
              </div>
            }

            <!-- Users List - Card-based layout that works on all screens -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              @if (isLoading()) {
                <div class="flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <span class="ml-3 text-gray-400">Loading users...</span>
                </div>
              } @else if (errorMessage()) {
                <div class="flex flex-col items-center justify-center py-12 text-red-400">
                  <span class="material-icons-outlined text-4xl mb-2">error</span>
                  <p class="text-center px-4">{{ errorMessage() }}</p>
                  <button (click)="loadUsers()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
                    Try Again
                  </button>
                </div>
              } @else if (users().length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                  <span class="material-icons-outlined text-4xl mb-2">people_outline</span>
                  <p>No users found</p>
                </div>
              } @else {
                <!-- Select All Header -->
                <div class="px-4 py-3 bg-gray-900/50 border-b border-gray-700 flex items-center gap-3">
                  <input
                    type="checkbox"
                    [checked]="allSelected()"
                    (change)="toggleSelectAll()"
                    class="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span class="text-xs text-gray-400 uppercase tracking-wider">Select All</span>
                </div>

                <!-- User Cards -->
                <div class="divide-y divide-gray-700">
                  @for (user of users(); track user.id) {
                    <div class="p-4 hover:bg-gray-700/30 transition-colors">
                      @if (user.isEditing && editFormData(); as formData) {
                        <!-- Edit Mode -->
                        <div class="space-y-4">
                          <div class="flex items-center gap-3">
                            @if (user.avatarUrl) {
                              <img [src]="user.avatarUrl" alt="" class="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                            } @else {
                              <div class="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                                {{ user.name.charAt(0).toUpperCase() }}
                              </div>
                            }
                            <div class="flex-1 min-w-0">
                              <p class="text-gray-400 text-xs truncate">{{ user.email }}</p>
                              <p class="text-gray-500 text-xs">ID: {{ user.id }}</p>
                            </div>
                          </div>
                          
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label class="block text-xs text-gray-400 mb-1">Name</label>
                              <input
                                type="text"
                                [ngModel]="formData.name"
                                (ngModelChange)="updateFormField('name', $event)"
                                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label class="block text-xs text-gray-400 mb-1">Role</label>
                              <select
                                [ngModel]="formData.roleId"
                                (ngModelChange)="updateFormField('roleId', $event)"
                                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                @for (role of roles(); track role.id) {
                                  <option [ngValue]="role.id">{{ role.name }}</option>
                                }
                              </select>
                            </div>
                          </div>
                          
                          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                [ngModel]="formData.isActive"
                                (ngModelChange)="updateFormField('isActive', $event)"
                                class="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                              />
                              <span class="text-sm text-gray-300">Active</span>
                            </label>
                            
                            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                (click)="cancelEdit()"
                                class="px-4 py-2 text-gray-400 hover:text-white text-sm rounded-lg hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                              <button
                                (click)="saveUser()"
                                [disabled]="isSaving()"
                                class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
                              >
                                @if (isSaving()) {
                                  <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                }
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      } @else {
                        <!-- View Mode -->
                        <div class="flex items-start gap-3">
                          <!-- Checkbox -->
                          <input
                            type="checkbox"
                            [checked]="isSelected(user.id)"
                            (change)="toggleSelect(user.id)"
                            class="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500 flex-shrink-0 mt-1"
                          />
                          
                          <!-- Avatar -->
                          @if (user.avatarUrl) {
                            <img [src]="user.avatarUrl" alt="" class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          } @else {
                            <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                              {{ user.name.charAt(0).toUpperCase() }}
                            </div>
                          }
                          
                          <!-- User Info -->
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                              <p class="text-white font-medium">{{ user.name }}</p>
                              <span
                                [class]="user.roleName.toLowerCase() === 'admin' 
                                  ? 'px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full'
                                  : 'px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full'"
                              >
                                {{ user.roleName }}
                              </span>
                              <span
                                [class]="user.isActive 
                                  ? 'flex items-center gap-1 text-green-400 text-xs'
                                  : 'flex items-center gap-1 text-red-400 text-xs'"
                              >
                                <span class="w-1.5 h-1.5 rounded-full" [class]="user.isActive ? 'bg-green-400' : 'bg-red-400'"></span>
                                {{ user.isActive ? 'Active' : 'Inactive' }}
                              </span>
                            </div>
                            <p class="text-gray-400 text-sm truncate">{{ user.email }}</p>
                            <p class="text-gray-500 text-xs mt-1">
                              Last login: {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
                            </p>
                          </div>
                          
                          <!-- Actions -->
                          <div class="flex items-center gap-1 flex-shrink-0">
                            <button
                              (click)="startEdit(user)"
                              class="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <span class="material-icons-outlined text-lg">edit</span>
                            </button>
                            <button
                              (click)="toggleUserStatus(user)"
                              [class]="user.isActive 
                                ? 'p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors'
                                : 'p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors'"
                              [title]="user.isActive ? 'Deactivate' : 'Activate'"
                            >
                              <span class="material-icons-outlined text-lg">{{ user.isActive ? 'person_off' : 'person_add' }}</span>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Pagination -->
                @if (paginatedResult(); as result) {
                  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-gray-700 bg-gray-900/50">
                    <p class="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                      {{ (result.pageNumber - 1) * result.pageSize + 1 }}-{{ Math.min(result.pageNumber * result.pageSize, result.totalCount) }} of {{ result.totalCount }}
                    </p>
                    <div class="flex items-center gap-2">
                      <button
                        (click)="goToPage(result.pageNumber - 1)"
                        [disabled]="!result.hasPreviousPage"
                        class="p-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span class="material-icons-outlined text-lg">chevron_left</span>
                      </button>
                      <span class="text-gray-400 text-sm px-2">{{ result.pageNumber }}/{{ result.totalPages }}</span>
                      <button
                        (click)="goToPage(result.pageNumber + 1)"
                        [disabled]="!result.hasNextPage"
                        class="p-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span class="material-icons-outlined text-lg">chevron_right</span>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Toast Notification -->
    @if (toastMessage()) {
      <div
        class="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slide-up"
        [class]="toastType() === 'success' 
          ? 'bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2'
          : 'bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2'"
      >
        <span class="material-icons-outlined text-lg flex-shrink-0">{{ toastType() === 'success' ? 'check_circle' : 'error' }}</span>
        <span class="text-sm">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slide-up 0.3s ease-out; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class AdminComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // Tabs
  tabs = [
    { id: 'users', label: 'Users', icon: 'people' },
  ];
  activeTab = signal<string>('users');

  // State
  users = signal<EditableUser[]>([]);
  roles = signal<Role[]>([]);
  paginatedResult = signal<PaginatedResult<User> | null>(null);
  selectedUserIds = signal<Set<number>>(new Set());
  editFormData = signal<EditFormData | null>(null);  // Separate signal for edit form
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = 10;

  // Computed
  selectedUsers = computed(() => {
    const ids = this.selectedUserIds();
    return this.users().filter(u => ids.has(u.id));
  });

  allSelected = computed(() => {
    const userList = this.users();
    const selected = this.selectedUserIds();
    return userList.length > 0 && userList.every(u => selected.has(u.id));
  });

  activeUsersCount = computed(() => this.users().filter(u => u.isActive).length);
  inactiveUsersCount = computed(() => this.users().filter(u => !u.isActive).length);
  adminUsersCount = computed(() => this.users().filter(u => u.roleName.toLowerCase() === 'admin').length);

  // Stats cards computed for cleaner template
  statsCards = computed(() => [
    { label: 'Total', value: this.paginatedResult()?.totalCount || 0, icon: 'people', bgClass: 'bg-indigo-500/20', iconClass: 'text-indigo-400' },
    { label: 'Active', value: this.activeUsersCount(), icon: 'check_circle', bgClass: 'bg-green-500/20', iconClass: 'text-green-400' },
    { label: 'Admins', value: this.adminUsersCount(), icon: 'admin_panel_settings', bgClass: 'bg-yellow-500/20', iconClass: 'text-yellow-400' },
    { label: 'Inactive', value: this.inactiveUsersCount(), icon: 'block', bgClass: 'bg-red-500/20', iconClass: 'text-red-400' },
  ]);

  // Expose Math to template
  Math = Math;

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getAllUsers(this.currentPage(), this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.paginatedResult.set(result);
          this.users.set(result.items.map(u => ({ ...u, isEditing: false })));
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load users');
          this.isLoading.set(false);
        }
      });
  }

  loadRoles(): void {
    this.userService.getAllRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (roles) => this.roles.set(roles),
        error: () => {
          // Fallback roles if API fails
          this.roles.set([
            { id: 1, name: 'admin', description: 'Administrator' },
            { id: 2, name: 'user', description: 'Regular User' }
          ]);
        }
      });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  // Selection
  toggleSelect(userId: number): void {
    const current = new Set(this.selectedUserIds());
    if (current.has(userId)) {
      current.delete(userId);
    } else {
      current.add(userId);
    }
    this.selectedUserIds.set(current);
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedUserIds.set(new Set());
    } else {
      this.selectedUserIds.set(new Set(this.users().map(u => u.id)));
    }
  }

  isSelected(userId: number): boolean {
    return this.selectedUserIds().has(userId);
  }

  clearSelection(): void {
    this.selectedUserIds.set(new Set());
  }

  // Editing
  startEdit(user: EditableUser): void {
    const roleId = this.roles().find(r => r.name.toLowerCase() === user.roleName.toLowerCase())?.id || 2;
    
    // Set editing state on users
    this.users.update(users => users.map(u => ({
      ...u,
      isEditing: u.id === user.id
    })));
    
    // Set the form data in a separate signal
    this.editFormData.set({
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl || '',
      roleId: roleId,
      isActive: user.isActive
    });
  }

  cancelEdit(): void {
    this.users.update(users => users.map(u => ({ ...u, isEditing: false })));
    this.editFormData.set(null);
  }

  // Update form field
  updateFormField(field: keyof EditFormData, value: any): void {
    const current = this.editFormData();
    if (current) {
      this.editFormData.set({ ...current, [field]: value });
    }
  }

  saveUser(): void {
    const formData = this.editFormData();
    if (!formData) return;

    this.isSaving.set(true);

    // Ensure roleId is a number
    const roleId = Number(formData.roleId);

    const data: AdminUserUpdateRequest = {
      name: formData.name.trim(),
      avatarUrl: formData.avatarUrl?.trim() || undefined,
      roleId: roleId,
      isActive: formData.isActive
    };

    this.userService.adminUpdateUser(formData.userId, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedUser) => {
          // Update the user in the list
          this.users.update(users => 
            users.map(u => u.id === formData.userId 
              ? { ...updatedUser, isEditing: false }
              : u
            )
          );
          this.editFormData.set(null);
          this.isSaving.set(false);
          this.showToast('User updated successfully', 'success');
        },
        error: (error) => {
          this.isSaving.set(false);
          this.showToast(error.message || 'Failed to update user', 'error');
        }
      });
  }

  // Quick actions
  toggleUserStatus(user: EditableUser): void {
    const newStatus = !user.isActive;
    
    this.userService.toggleUserActive(user.id, newStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.users.update(users =>
            users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u)
          );
          this.showToast(`User ${newStatus ? 'activated' : 'deactivated'}`, 'success');
        },
        error: (error) => {
          this.showToast(error.message || 'Failed to update status', 'error');
        }
      });
  }

  // Bulk actions
  bulkActivate(): void {
    const toActivate = this.selectedUsers().filter(u => !u.isActive);
    if (toActivate.length === 0) {
      this.showToast('All selected users are already active', 'success');
      return;
    }

    let completed = 0;
    toActivate.forEach(user => {
      this.userService.toggleUserActive(user.id, true)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.users.update(users => users.map(u => u.id === user.id ? { ...u, isActive: true } : u));
            completed++;
            if (completed === toActivate.length) {
              this.showToast(`${completed} user(s) activated`, 'success');
              this.clearSelection();
            }
          }
        });
    });
  }

  bulkDeactivate(): void {
    const currentUserId = this.authService.getCurrentUserId();
    const toDeactivate = this.selectedUsers().filter(u => u.isActive && u.id !== currentUserId);
    
    if (toDeactivate.length === 0) {
      this.showToast('No users to deactivate', 'error');
      return;
    }

    let completed = 0;
    toDeactivate.forEach(user => {
      this.userService.toggleUserActive(user.id, false)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.users.update(users => users.map(u => u.id === user.id ? { ...u, isActive: false } : u));
            completed++;
            if (completed === toDeactivate.length) {
              this.showToast(`${completed} user(s) deactivated`, 'success');
              this.clearSelection();
            }
          }
        });
    });
  }

  // Helpers
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}

export default AdminComponent;
