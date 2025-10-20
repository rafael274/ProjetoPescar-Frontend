import { Component, OnInit } from '@angular/core';
import { MaterialService } from '../../services/material-service';
import { CategoriaService } from '../../services/categoria-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tela-cadastrar-material',
  templateUrl: './tela-cadastrar-material.html',
  styleUrls: ['./tela-cadastrar-material.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class TelaCadastrarMaterial implements OnInit {
  mensagem = '';
  categorias: any[] = [];

  constructor(
    private materialService: MaterialService,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => this.categorias = cats ?? [],
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
        this.categorias = [];
      }
    });
  }

  // captura o submit do form e envia para a API
  cadastrar(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const nome = (form.querySelector('#nome') as HTMLInputElement)?.value.trim() ?? '';
    const descricao = (form.querySelector('#descricao') as HTMLTextAreaElement)?.value.trim() ?? '';
    const quantidadeStr = (form.querySelector('#quantidade') as HTMLInputElement)?.value ?? '0';
    const estoqueMinimoStr = (form.querySelector('#estoque_minimo') as HTMLInputElement)?.value ?? '0';
    const categoriaId = (form.querySelector('#categoria') as HTMLSelectElement)?.value ?? '';

    const quantidade = parseInt(quantidadeStr, 10) || 0;
    const estoqueMinimo = parseInt(estoqueMinimoStr, 10) || 0;

    // payload conforme exemplo do swagger
    const payload = {
      nome,
      descricao,
      quantidade,
      estoqueMinimo,
      categoriaId: categoriaId || null
    };

    this.materialService.cadastrarMaterial(payload).subscribe({
      next: () => {
        this.mensagem = 'Material cadastrado com sucesso.';
        form.reset();
        // redireciona para /estoque após 2 segundos
        setTimeout(() => this.router.navigate(['/estoque']), 2000);
      },
      error: (err) => {
        console.error('Erro ao cadastrar material:', err);
        this.mensagem = err?.error?.message ?? 'Erro ao cadastrar material.';
      }
    });
  }

  // novo: navegar para a tela de gerenciamento/edição/exclusão (use /estoque ou ajuste)
  irParaEstoque() {
    this.router.navigate(['/editar-material']);
  }
}
