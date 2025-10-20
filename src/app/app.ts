import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // novo import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('projetoPescar');

  constructor(private router: Router, private auth: AuthService) {} // injeta AuthService

  // chama logout no AuthService
  doLogout(): void {
    this.auth.logout();
  }

  showSidebar(): boolean {
    // Ajuste a rota conforme necessário
    return this.router.url !== '/login' && this.router.url !== '/';
  }
}
