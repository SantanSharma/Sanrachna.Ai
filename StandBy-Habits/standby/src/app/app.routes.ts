import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | StandBy'
  },
  {
    path: 'habits',
    loadComponent: () => import('./pages/habits-list/habits-list.component').then(m => m.HabitsListComponent),
    title: 'Habits | StandBy'
  },
  {
    path: 'habits/new',
    loadComponent: () => import('./pages/habit-form/habit-form.component').then(m => m.HabitFormComponent),
    title: 'New Habit | StandBy'
  },
  {
    path: 'habits/:id',
    loadComponent: () => import('./pages/habit-detail/habit-detail.component').then(m => m.HabitDetailComponent),
    title: 'Habit Details | StandBy'
  },
  {
    path: 'habits/:id/edit',
    loadComponent: () => import('./pages/habit-form/habit-form.component').then(m => m.HabitFormComponent),
    title: 'Edit Habit | StandBy'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
