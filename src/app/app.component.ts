import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <p>&copy; 2025 Bioskop. Sva prava zadržana.</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: Roboto, "Helvetica Neue", sans-serif;
    }
    .app-content {
      flex-grow: 1;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .app-footer {
      background-color: #3f51b5;
      color: white;
      text-align: center;
      padding: 15px;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent
  ]
})
export class AppComponent {
  title = 'digital-cinema-counter';
}
