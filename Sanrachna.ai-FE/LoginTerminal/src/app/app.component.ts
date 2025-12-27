import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

/**
 * Root application component
 * Provides the main layout structure with router outlet and global components
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <div class="min-h-screen bg-dark-bg">
      <router-outlet></router-outlet>
      <app-toast></app-toast>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'LoginTerminal';
}
