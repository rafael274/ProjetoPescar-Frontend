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
  isMobileView = false;
  isSidebarOpen = false;

  constructor(private router: Router, private auth: AuthService) {
    // Check initial screen size
    this.checkScreenSize();
    // Listen for window resize
    window.addEventListener('resize', () => this.checkScreenSize());
  } // injeta AuthService

  // chama logout no AuthService
  doLogout(): void {
    this.auth.logout();
  }

  showSidebar(): boolean {
    // Ajuste a rota conforme necessário
    return this.router.url !== '/login' && this.router.url !== '/';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth <= 600;
    // Close sidebar by default on mobile
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }

  // Clean up the resize listener when component is destroyed
  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkScreenSize());
  }
}
