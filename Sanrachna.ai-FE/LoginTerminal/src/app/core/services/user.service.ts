import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, tap, catchError } from 'rxjs';
import { 
  User, 
  UserInfo,
  ProfileUpdateRequest, 
  PasswordChangeRequest, 
  ApiResponse,
  PaginatedResult,
  AdminUserUpdateRequest,
  RoleUpdateRequest,
  Role
} from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * User Service
 * Handles user profile operations and management.
 * Integrates with backend API endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Loading state
  private isLoadingSignal = signal<boolean>(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /**
   * Get current authenticated user's profile
   * GET /api/Users/me
   */
  getCurrentUser(): Observable<User> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/Users/me`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get user profile');
        }
        return response.data;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get user by ID (Admin only)
   * GET /api/Users/{id}
   */
  getUserById(id: number): Observable<User> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/Users/${id}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'User not found');
        }
        return response.data;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all users with pagination (Admin only)
   * GET /api/Users?pageNumber={pageNumber}&pageSize={pageSize}
   */
  getAllUsers(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResult<User>> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<PaginatedResult<User>>>(
      `${this.apiUrl}/Users?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get users');
        }
        return response.data;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Update user profile
   * PUT /api/Users/{id}
   */
  updateProfile(id: number, data: ProfileUpdateRequest): Observable<User> {
    this.isLoadingSignal.set(true);

    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/Users/${id}`, data).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update profile');
        }
        return response.data;
      }),
      tap(updatedUser => {
        // Update stored user info if updating own profile
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId === id) {
          // Update user in AuthService (updates both signal and localStorage)
          const userInfo: UserInfo = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
            role: updatedUser.roleName
          };
          this.authService.updateCurrentUser(userInfo);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Update current user's profile
   */
  updateCurrentUserProfile(data: ProfileUpdateRequest): Observable<User> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('Not authenticated'));
    }
    return this.updateProfile(userId, data);
  }

  /**
   * Change user password
   * PUT /api/Users/{id}/password
   */
  changePassword(id: number, data: PasswordChangeRequest): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/Users/${id}/password`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to change password');
        }
        return undefined;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Change current user's password
   */
  changeCurrentUserPassword(data: PasswordChangeRequest): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('Not authenticated'));
    }
    return this.changePassword(userId, data);
  }

  /**
   * Delete user (Admin only - soft delete)
   * DELETE /api/Users/{id}
   */
  deleteUser(id: number): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/Users/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete user');
        }
        return undefined;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  // ========== Admin Methods ==========

  /**
   * Admin update user (Admin only)
   * PUT /api/Users/{id}/admin
   */
  adminUpdateUser(id: number, data: AdminUserUpdateRequest): Observable<User> {
    this.isLoadingSignal.set(true);

    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/Users/${id}/admin`, data).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update user');
        }
        return response.data;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Update user role (Admin only)
   * PUT /api/Users/{id}/role
   */
  updateUserRole(id: number, roleId: number): Observable<void> {
    this.isLoadingSignal.set(true);

    const data: RoleUpdateRequest = { roleId };
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/Users/${id}/role`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update role');
        }
        return undefined;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Toggle user active status (Admin only)
   * PUT /api/Users/{id}/toggle-active
   */
  toggleUserActive(id: number, isActive: boolean): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/Users/${id}/toggle-active?isActive=${isActive}`, {}).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update user status');
        }
        return undefined;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all roles (Admin only)
   * GET /api/Roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/Roles`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get roles');
        }
        return response.data;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Private helper methods

  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof HttpErrorResponse) {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors?.length > 0) {
        errorMessage = error.error.errors.join(', ');
      } else if (error.status === 401) {
        errorMessage = 'Not authenticated';
      } else if (error.status === 403) {
        errorMessage = 'Access denied';
      } else if (error.status === 404) {
        errorMessage = 'User not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request data';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
