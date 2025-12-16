import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, tap, catchError } from 'rxjs';
import { 
  Application, 
  ApplicationCreateRequest, 
  ApplicationUpdateRequest,
  ApplicationAccessRequest 
} from '../models/application.model';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

/**
 * Application Service
 * Handles application management and user access operations.
 * Integrates with backend API endpoints at /api/apps.
 */
@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // Loading state
  private isLoadingSignal = signal<boolean>(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /**
   * Get all applications
   * GET /api/apps
   */
  getAllApplications(): Observable<Application[]> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<Application[]>>(`${this.apiUrl}/apps`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get applications');
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
   * Get application by ID
   * GET /api/apps/{id}
   */
  getApplicationById(id: number): Observable<Application> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<Application>>(`${this.apiUrl}/apps/${id}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Application not found');
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
   * Get current user's accessible applications
   * GET /api/apps/my
   */
  getMyApplications(): Observable<Application[]> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<Application[]>>(`${this.apiUrl}/apps/my`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get applications');
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
   * Get applications accessible by a specific user
   * GET /api/apps/user/{userId}
   */
  getUserApplications(userId: number): Observable<Application[]> {
    this.isLoadingSignal.set(true);

    return this.http.get<ApiResponse<Application[]>>(`${this.apiUrl}/apps/user/${userId}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get user applications');
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
   * Create a new application (Admin only)
   * POST /api/apps
   */
  createApplication(data: ApplicationCreateRequest): Observable<Application> {
    this.isLoadingSignal.set(true);

    return this.http.post<ApiResponse<Application>>(`${this.apiUrl}/apps`, data).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create application');
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
   * Update an application (Admin only)
   * PUT /api/apps/{id}
   */
  updateApplication(id: number, data: ApplicationUpdateRequest): Observable<Application> {
    this.isLoadingSignal.set(true);

    return this.http.put<ApiResponse<Application>>(`${this.apiUrl}/apps/${id}`, data).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update application');
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
   * Delete an application (Admin only - soft delete)
   * DELETE /api/apps/{id}
   */
  deleteApplication(id: number): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/apps/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete application');
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
   * Assign application access to a user (Admin only)
   * POST /api/apps/assign
   */
  assignAccess(data: ApplicationAccessRequest): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/apps/assign`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to assign access');
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
   * Revoke application access from a user (Admin only)
   * DELETE /api/apps/revoke
   */
  revokeAccess(data: ApplicationAccessRequest): Observable<void> {
    this.isLoadingSignal.set(true);

    return this.http.request<ApiResponse<void>>('DELETE', `${this.apiUrl}/apps/revoke`, { body: data }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to revoke access');
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
        errorMessage = 'Application not found';
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
