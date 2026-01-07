import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoalService } from './services';
import { SsoAuthService } from './core/auth';
import { HeaderComponent } from './components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  template: `
    @if (isAuthenticated()) {
      <app-header />
    }
    <router-outlet />
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private goalService = inject(GoalService);
  private authService = inject(SsoAuthService);

  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    // Initialize SSO authentication
    const isAuthenticated = this.authService.initializeAuth();
    
    if (isAuthenticated) {
      // Setup listener for logout detection from other apps
      this.authService.setupVisibilityListener();
      
      // Redirect based on goal state
      if (this.goalService.hasActiveGoal()) {
        this.router.navigate(['/dashboard']);
      }
    }
  }
}
