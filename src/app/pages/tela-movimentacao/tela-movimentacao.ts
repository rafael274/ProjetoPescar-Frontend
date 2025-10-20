import { Component, OnInit } from '@angular/core';
import { MaterialService } from '../../services/material-service';
import { MovimentacaoService } from '../../services/movimentacao-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tela-movimentacao',
  templateUrl: './tela-movimentacao.html',
  styleUrls: ['./tela-movimentacao.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class TelaMovimentacao implements OnInit {
  mensagem = '';
  materiais: any[] = [];

  constructor(
    private materialService: MaterialService,
    private movimentacaoService: MovimentacaoService
  ) {}

  ngOnInit(): void {
    this.materialService.listarMateriais().subscribe({
      next: (items) => this.materiais = items ?? [],
      error: (err) => {
        console.error('Erro ao carregar materiais:', err);
        this.materiais = [];
      }
    });
  }

  registrar(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const tipoStr = (form.querySelector('#tipo') as HTMLSelectElement)?.value ?? '1';
    const tipo = parseInt(tipoStr, 10) || 1; // 1 = entrada, 2 = saida

    const materialId = (form.querySelector('#material') as HTMLSelectElement)?.value ?? '';
    const quantidadeStr = (form.querySelector('#quantidade') as HTMLInputElement)?.value ?? '0';
    const data = (form.querySelector('#data') as HTMLInputElement)?.value ?? '';

    const quantidade = parseInt(quantidadeStr, 10) || 0;

    const payload = {
      materialId,
      quantidade,
      tipo,
      data // espera string no formato YYYY-MM-DD (input date fornece esse formato)
    };

    this.movimentacaoService.registrarMovimentacao(payload).subscribe({
      next: () => {
        this.mensagem = 'Movimentação registrada com sucesso.';
        form.reset();
      },
      error: (err) => {
        console.error('Erro ao registrar movimentação:', err);
        this.mensagem = err?.error?.message ?? 'Erro ao registrar movimentação.';
      }
    });
  }
}
