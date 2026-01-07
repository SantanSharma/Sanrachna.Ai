import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { GoalService } from './services';

const hasGoalGuard = () => {
  const goalService = inject(GoalService);
  return goalService.hasActiveGoal();
};

const noGoalGuard = () => {
  const goalService = inject(GoalService);
  return !goalService.hasActiveGoal();
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/goal-setup/goal-setup.component')
      .then(m => m.GoalSetupComponent),
    canActivate: [noGoalGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [hasGoalGuard],
  },
  {
    path: 'timeline',
    loadComponent: () => import('./pages/timeline/timeline.component')
      .then(m => m.TimelineComponent),
    canActivate: [hasGoalGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
