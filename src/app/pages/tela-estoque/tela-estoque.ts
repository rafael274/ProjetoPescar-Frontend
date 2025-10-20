import { Component, OnInit } from '@angular/core';
import { MaterialService } from '../../services/material-service';
import { Material } from '../../models/material.model';
import { CategoriaService } from '../../services/categoria-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tela-estoque',
  templateUrl: './tela-estoque.html',
  styleUrls: ['./tela-estoque.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class TelaEstoque implements OnInit {
  materiais: Material[] = [];
  categorias: any[] = [];

  // dados prontos para exibição
  displayedMaterials: Material[] = [];

  // filtro / ordenação
  filterCategoryId: string | null = null; // null = todos

  constructor(private materialService: MaterialService, private categoriaService: CategoriaService) {}

  ngOnInit() {
    this.loadCategorias();
    this.loadMateriais();
  }

  loadMateriais() {
    this.materialService.listarMateriais().subscribe({
      next: (data) => {
        this.materiais = data ?? [];
        this.applyFilterAndSort();
      },
      error: () => {
        this.materiais = [];
        this.applyFilterAndSort();
      }
    });
  }

  loadCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats ?? [];
        this.applyFilterAndSort();
      },
      error: () => {
        this.categorias = [];
        this.applyFilterAndSort();
      }
    });
  }

  private applyFilterAndSort() {
    // filtra
    const filtered = this.materiais.filter(m => {
      if (!this.filterCategoryId) return true;

      // obtém um identificador/categoria do material de forma segura,
      // lidando com categoriaId (string) ou categoria (string | object)
      let candidate: any = m.categoriaId ?? '';
      if ((!candidate || candidate === '') && m.categoria != null) {
        if (typeof m.categoria === 'object') {
          // se for objeto, tenta pegar .id primeiro, senão tenta outras propriedades plausíveis
          candidate = (m.categoria as any).id ?? (m.categoria as any).nome ?? '';
        } else {
          // se for string, usa direto
          candidate = m.categoria;
        }
      }

      const mCid = String(candidate ?? '');
      return String(this.filterCategoryId) === mCid;
    });

    // sempre ordenar alfabeticamente e exibir na tabela
    this.displayedMaterials = filtered.slice().sort((a, b) => String(a.nome ?? '').localeCompare(String(b.nome ?? ''), undefined, { sensitivity: 'base' }));
  }

  public getCategoryName(m: Material): string | null {
    if (m.categoria && typeof m.categoria === 'object' && (m.categoria as any).nome) return (m.categoria as any).nome;
    if (m.categoria && typeof m.categoria === 'string') return m.categoria;
    if (m.categoriaId) {
      const found = this.categorias.find(c => String(c.id) === String(m.categoriaId));
      if (found) return found.nome ?? found.descricao ?? String(found.id);
    }
    return null;
  }

  // handlers usados no template
  onFilterChange(categoryId: string) {
    this.filterCategoryId = categoryId || null;
    this.applyFilterAndSort();
  }
}
