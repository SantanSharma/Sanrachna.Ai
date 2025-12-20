import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

/**
 * Application routes with lazy loading
 * - Auth routes (login, register) protected by guestGuard (redirect if logged in)
 * - Protected routes (dashboard, settings) protected by authGuard (require authentication)
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Auth routes - only accessible when NOT logged in
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Sign In - Sanrachna Portal'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Create Account - Sanrachna Portal'
  },
  // Protected routes - require authentication
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Sanrachna Portal'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile - Sanrachna Portal'
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Settings - Sanrachna Portal'
  },
  {
    path: 'logout',
    loadComponent: () => import('./features/auth/logout/logout.component').then(m => m.LogoutComponent),
    canActivate: [authGuard],
    title: 'Sign Out - Sanrachna Portal'
  },
  // Wildcard route - redirect to login
  {
    path: '**',
    redirectTo: 'login'
  }
];
