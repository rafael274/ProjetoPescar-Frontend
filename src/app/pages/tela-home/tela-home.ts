import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MaterialService } from '../../services/material-service';
import { MovimentacaoService } from '../../services/movimentacao-service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-tela-home',
  templateUrl: './tela-home.html',
  styleUrls: ['./tela-home.css']
})
export class TelaHome implements OnInit, AfterViewInit {
  totalProducts = 0;
  totalItemsInStock = 0;
  zeroStockCount = 0;
  minStockCount = 0;

  @ViewChild('chartEntradasSaidas') chartEntradasSaidasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartAtividades') chartAtividadesRef!: ElementRef<HTMLCanvasElement>;

  private entradasSaidasChart: any;
  private atividadesChart: any;

  constructor(private materialService: MaterialService, private movimentacaoService: MovimentacaoService) { }

  ngOnInit(): void {
    this.loadMaterials();
    this.loadMovimentacoesAndBuildCharts();
  }

  ngAfterViewInit(): void {
    // charts serão inicializados após os dados chegarem em loadMovimentacoesAndBuildCharts
  }

  private loadMaterials() {
    this.materialService.listarMateriais().subscribe({
      next: (materials: any[]) => {
        // keys possíveis para quantidade / estoque mínimo
        const qtyKeys = ['quantidade','Quantidade','quantity','qty','qtd','QTD','amount','stock','quantidade_atual'];
        const minKeys = ['estoqueMinimo','estoqueminimo','estoque_minimo','estoque_min','minimo','minStock','minimo_estoque'];

        const getNum = (obj: any, keys: string[]) => {
          if (!obj) return 0;
          for (const k of keys) {
            if (typeof obj[k] === 'undefined' || obj[k] === null) continue;
            const raw = obj[k];
            if (typeof raw === 'number') {
              if (!isNaN(raw)) return raw;
            } else if (typeof raw === 'string') {
              const cleaned = raw.trim().replace(/\./g, '').replace(',', '.'); // trata "1.234,56"
              const n = Number(cleaned);
              if (!isNaN(n)) return n;
            }
          }
          return 0;
        };

        this.totalProducts = Array.isArray(materials) ? materials.length : 0;
        this.totalItemsInStock = (materials || []).reduce((acc: number, m: any) => acc + getNum(m, qtyKeys), 0);
        this.zeroStockCount = (materials || []).filter((m: any) => getNum(m, qtyKeys) === 0).length;
        this.minStockCount = (materials || []).filter((m: any) => {
          const q = getNum(m, qtyKeys);
          const min = getNum(m, minKeys);
          return min > 0 && q > 0 && q <= min;
        }).length;
      },
      error: () => {
        // Em caso de erro, mantém zeros (poderia mostrar toast/console)
      }
    });
  }

  private loadMovimentacoesAndBuildCharts() {
    this.movimentacaoService.listarMovimentacoes().subscribe({
      next: (movs: any[]) => {
        const last10 = this.getLastNDates(10);
        // preparar arrays com zeros
        const labels = last10.map(d => this.formatDateLabel(d));
        const entradas = new Array(10).fill(0);
        const saidas = new Array(10).fill(0);
        const atividades = new Array(10).fill(0);

        // tentar identificar campo data e tipo nas movimentações
        movs.forEach(m => {
          // possíveis campos: data, dataMovimentacao, createdAt
          const rawDate = m.data || m.dataMovimentacao || m.createdAt || m.data_movimentacao;
          // Normaliza o "tipo" da movimentação:
          // - se for numérico: 1 = entrada, 2 = saída
          // - se for string, tenta usar o conteúdo (entrada/saída/in/out)
          let tipoNormalized = '';
          const tipoRaw = (m.tipo ?? m.tipoMovimentacao ?? m.action ?? '');
          const tipoNum = Number(tipoRaw);
          if (!isNaN(tipoNum) && tipoNum !== 0) {
            if (tipoNum === 1) tipoNormalized = 'entrada';
            else if (tipoNum === 2) tipoNormalized = 'saida';
          } else {
            tipoNormalized = String(tipoRaw).toLowerCase();
          }
          const quantidade = Number(m.quantidade) || 1; // se não existir, contar como 1 atividade
          // normaliza a data evitando problemas com strings "YYYY-MM-DD" (treated as UTC)
          const d = this.parseAndNormalizeDate(rawDate);
          if (!d || isNaN(d.getTime())) {
            return;
          }
          // encontrar índice correspondente aos últimos 10 dias
          const idx = last10.findIndex(ld => this.isSameDay(ld, d));
          if (idx === -1) return;

          atividades[idx] += 1 * quantidade;

          if (tipoNormalized.includes('entrada') || tipoNormalized.includes('in') || tipoNormalized === '1') {
            entradas[idx] += quantidade;
          } else if (tipoNormalized.includes('saida') || tipoNormalized.includes('saída') || tipoNormalized.includes('out') || tipoNormalized === '2') {
            saidas[idx] += quantidade;
          } else {
            // se não souber o tipo, conta apenas como atividade
          }
        });

        this.buildEntradasSaidasChart(labels, entradas, saidas);
        this.buildAtividadesChart(labels, atividades);
      },
      error: () => {
        // se erro ao buscar movimentações, inicializa gráficos vazios com últimos 10 dias
        const labels = this.getLastNDates(10).map(d => this.formatDateLabel(d));
        this.buildEntradasSaidasChart(labels, new Array(10).fill(0), new Array(10).fill(0));
        this.buildAtividadesChart(labels, new Array(10).fill(0));
      }
    });
  }

  private buildEntradasSaidasChart(labels: string[], entradas: number[], saidas: number[]) {
    if (this.entradasSaidasChart) {
      this.entradasSaidasChart.data.labels = labels;
      this.entradasSaidasChart.data.datasets[0].data = entradas;
      this.entradasSaidasChart.data.datasets[1].data = saidas;
      this.entradasSaidasChart.update();
      return;
    }

    const ctx = this.chartEntradasSaidasRef.nativeElement.getContext('2d');
    this.entradasSaidasChart = new Chart(ctx!, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Entradas',
            data: entradas,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37,99,235,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 7,        // menor bolinha
            pointHoverRadius: 11,  // hover um pouco maior
            pointHitRadius: 16,    // área de interação aumentada
            pointBorderWidth: 2
          },
          {
            label: 'Saídas',
            data: saidas,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 7,
            pointHoverRadius: 11,
            pointHitRadius: 16,
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  private buildAtividadesChart(labels: string[], atividades: number[]) {
    if (this.atividadesChart) {
      this.atividadesChart.data.labels = labels;
      this.atividadesChart.data.datasets[0].data = atividades;
      this.atividadesChart.update();
      return;
    }

    const ctx = this.chartAtividadesRef.nativeElement.getContext('2d');
    this.atividadesChart = new Chart(ctx!, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Atividades no Sistema',
            data: atividades,
            borderColor: '#F97316',
            backgroundColor: 'rgba(249,115,22,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 7,
            pointHoverRadius: 11,
            pointHitRadius: 16,
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  private getLastNDates(n: number): Date[] {
    const arr: Date[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      arr.push(d);
    }
    return arr;
  }

  // Normaliza raw date para meia-noite local, tratando formatos comuns
  private parseAndNormalizeDate(raw: any): Date | null {
    if (!raw) return null;
    let d: Date | null = null;
    if (raw instanceof Date) {
      d = new Date(raw);
    } else if (typeof raw === 'number') {
      d = new Date(raw);
    } else if (typeof raw === 'string') {
      const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/; // "YYYY-MM-DD"
      if (isoDateOnly.test(raw)) {
        // força horário local (evita interpretação como UTC)
        d = new Date(raw + 'T00:00:00');
      } else if (/^\d+$/.test(raw)) {
        d = new Date(Number(raw));
      } else {
        d = new Date(raw);
      }
    }
    if (!d || isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0); // normaliza para meia-noite local
    return d;
  }

  private formatDateLabel(d: Date) {
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  private isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
