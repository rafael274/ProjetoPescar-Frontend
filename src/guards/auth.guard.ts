import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../app/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    const authenticated = this.auth.isAuthenticated();
    if (authenticated) {
      return true;
    }
    // Retorna UrlTree para que o Router trate a navegação (evita navegações duplicadas)
    return this.router.parseUrl('/login');
  }
}