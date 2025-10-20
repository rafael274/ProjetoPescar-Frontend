import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialService } from '../../services/material-service';
import { CategoriaService } from '../../services/categoria-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tela-editar-material',
  templateUrl: './tela-editar-material.html',
  styleUrls: ['./tela-editar-material.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class TelaEditarMaterial implements OnInit {
  mensagem = '';
  materiais: any[] = [];
  categorias: any[] = [];

  // formulário / modelo simplificado
  selectedId: string | null = null;
  nome = '';
  descricao = '';
  quantidade = 0;
  estoqueMinimo = 0;
  categoriaId: string | null = null;

  constructor(
    private materialService: MaterialService,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMateriais();
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => this.categorias = cats ?? [],
      error: () => this.categorias = []
    });
  }

  loadMateriais() {
    this.materialService.listarMateriais().subscribe({
      next: (items) => this.materiais = items ?? [],
      error: () => this.materiais = []
    });
  }

  // seleciona material usando apenas os campos esperados
  onSelectMaterial(id: string) {
    if (!id) { this.resetForm(); return; }

    const m = this.materiais.find(x => String(x.id) === String(id));
    if (!m) { this.resetForm(); this.mensagem = 'Material não encontrado.'; return; }

    this.selectedId = String(m.id);
    this.nome = m.nome ?? '';
    this.descricao = m.descricao ?? '';
    this.quantidade = Number(m.quantidade ?? 0);
    this.estoqueMinimo = Number(m.estoqueMinimo ?? 0);
    this.categoriaId = m.categoriaId ?? (m.categoria && m.categoria.id) ?? null;
    this.mensagem = '';
  }

  salvar() {
    if (!this.selectedId) { this.mensagem = 'Selecione um material.'; return; }

    const payload = {
      id: this.selectedId,
      nome: this.nome,
      descricao: this.descricao,
      quantidade: Number(this.quantidade) || 0,
      estoqueMinimo: Number(this.estoqueMinimo) || 0,
      categoriaId: this.categoriaId || null
    };

    this.materialService.atualizarMaterial(payload).subscribe({
      next: () => {
        this.mensagem = 'Material atualizado.';
        this.loadMateriais();
        setTimeout(() => this.router.navigate(['/estoque']), 2000);
      },
      error: (err) => {
        console.error(err);
        this.mensagem = err?.error?.message ?? 'Erro ao atualizar.';
      }
    });
  }

  excluir() {
    if (!this.selectedId) { this.mensagem = 'Selecione um material.'; return; }
    if (!confirm('Confirma exclusão?')) return;

    this.materialService.removerMaterial(this.selectedId).subscribe({
      next: () => {
        this.mensagem = 'Material removido.';
        this.resetForm();
        this.loadMateriais();
        setTimeout(() => this.router.navigate(['/estoque']), 2000);
      },
      error: (err) => {
        console.error(err);
        this.mensagem = err?.error?.message ?? 'Erro ao remover.';
      }
    });
  }

  resetForm() {
    this.selectedId = null;
    this.nome = '';
    this.descricao = '';
    this.quantidade = 0;
    this.estoqueMinimo = 0;
    this.categoriaId = null;
    this.mensagem = '';
  }
}
