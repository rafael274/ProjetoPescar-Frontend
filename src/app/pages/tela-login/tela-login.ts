import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [MatSnackBar],
  templateUrl: './tela-login.html',
  styleUrl: './tela-login.css'
})
export class TelaLogin  {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(
      this.username,
      this.password
    ).subscribe({
      next: (response: any) => {
        const token = response;
        localStorage.setItem('token', token);

        const payload = this.authService.decodeJwtPayload(token);

        if (payload && payload.Id) {
          localStorage.setItem('usuarioId', payload.Id);
        }

        this.snackBar.open(
          "Login realizado com sucesso!",
          "Fechar",
          { duration: 3000 }
        );

        this.router.navigate(['/home']);
      },
      error: () => {
        this.snackBar.open(
          "Credenciais inválidas!",
          "Fechar",
          { duration: 3000 }
        );
      }
    });
  }
}