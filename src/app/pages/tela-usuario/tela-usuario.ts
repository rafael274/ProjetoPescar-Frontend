import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario-service'; // adiciona service
import { Usuario } from '../../models/usuario.model'; // adiciona modelo

@Component({
  selector: 'app-tela-usuario',
  templateUrl: './tela-usuario.html',
  styleUrls: ['./tela-usuario.css'],
  imports: [CommonModule, FormsModule]
})
export class TelaUsuario {
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = ''; // novo campo
  message: string = '';

  constructor(private usuarioService: UsuarioService) {} // injeta service

  onSubmit() {
    // cria payload conforme swagger
    const usuario: Usuario = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      confirmarSenha: this.confirmarSenha
    };

    this.usuarioService.adicionarUsuario(usuario).subscribe({
      next: () => {
        this.message = 'Usuário adicionado com sucesso.';
        // limpa formulário
        this.nome = '';
        this.email = '';
        this.senha = '';
        this.confirmarSenha = '';
      },
      error: (err) => {
        console.error('Erro ao adicionar usuário', err);
        if (err?.status === 401) {
          this.message = 'Não autorizado (401). Faça login e tente novamente.';
        } else {
          this.message = 'Erro ao adicionar usuário. Verifique os dados e tente novamente.';
        }
      }
    });
  }

  onCancel() {
    // comportamento de "Sair" — pode navegar ou apenas limpar campos
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';
    this.message = '';
  }
}
