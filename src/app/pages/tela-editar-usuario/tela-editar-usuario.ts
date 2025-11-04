import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario-service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-tela-editar-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-editar-usuario.html',
  styleUrl: './tela-editar-usuario.css',
  standalone: true
})
export class TelaEditarUsuario implements OnInit {
  usuarios: Usuario[] = [];
  message: string = '';
  editandoUsuario: Usuario | null = null;
  currentUserId: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.setCurrentUserId();
    this.carregarUsuarios();
  }

  private setCurrentUserId() {
    // Prefer token payload decoding; fallback to localStorage 'usuarioId' if present
    const token = this.authService.getToken();
    if (token) {
      const payload = this.authService.decodeJwtPayload(token);
      if (payload && (payload.Id || payload.id)) {
        this.currentUserId = payload.Id || payload.id || null;
        return;
      }
    }

    const stored = localStorage.getItem('usuarioId');
    this.currentUserId = stored ?? null;
  }

  /**
   * Quick helper: open edit form for the current logged-in user.
   */
  editarMeuPerfil() {
    if (!this.currentUserId) return;
    const u = this.usuarios.find(x => x.id === this.currentUserId);
    if (u) this.editarUsuario(u);
    else this.message = 'Seu usuário não foi encontrado na lista.';
  }

  carregarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.message = 'Erro ao carregar usuários. Por favor, tente novamente.';
      }
    });
  }

  editarUsuario(usuario: Usuario) {
    this.editandoUsuario = { ...usuario };
  }

  deletarUsuario(id: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.usuarioService.deletarUsuario(id).subscribe({
        next: () => {
          this.message = 'Usuário excluído com sucesso!';
          this.carregarUsuarios();
        },
        error: (err) => {
          console.error('Erro ao excluir usuário:', err);
          this.message = 'Erro ao excluir usuário. Por favor, tente novamente.';
        }
      });
    }
  }

  salvarEdicao() {
    if (!this.editandoUsuario) return;

    this.usuarioService.atualizarUsuario(this.editandoUsuario).subscribe({
      next: () => {
        this.message = 'Usuário atualizado com sucesso!';
        this.carregarUsuarios();
        this.editandoUsuario = null;
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this.message = 'Erro ao atualizar usuário. Por favor, tente novamente.';
      }
    });
  }

  cancelarEdicao() {
    this.editandoUsuario = null;
    this.message = '';
  }

  voltar() {
    this.router.navigate(['/usuario']);
  }
}
