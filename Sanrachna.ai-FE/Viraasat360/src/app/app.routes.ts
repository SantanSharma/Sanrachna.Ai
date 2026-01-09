import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | Viraasat360'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    title: 'My Profile | Viraasat360'
  },
  {
    path: 'family',
    loadComponent: () => import('./pages/family/family.component').then(m => m.FamilyComponent),
    title: 'Family Hierarchy | Viraasat360'
  },
  {
    path: 'assets',
    loadComponent: () => import('./pages/assets/assets.component').then(m => m.AssetsComponent),
    title: 'My Assets | Viraasat360'
  },
  {
    path: 'liabilities',
    loadComponent: () => import('./pages/liabilities/liabilities.component').then(m => m.LiabilitiesComponent),
    title: 'My Liabilities | Viraasat360'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
