import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimentacaoService } from '../../services/movimentacao-service';

@Component({
  selector: 'app-tela-relatorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-relatorio.html',
  styleUrls: ['./tela-relatorio.css']
})
export class TelaRelatorio implements OnInit {
  // bindings para o template
  reportType: 'monthly' | 'annual' = 'monthly';
  month: number | null = null; // 1-12
  year: number | null = null;

  // dados carregados
  movimentacoes: any[] = [];
  filteredMovimentacoes: any[] = [];
  totais: { entradas: number; saidas: number } = { entradas: 0, saidas: 0 };
  availableYears: number[] = [];

  constructor(private movService: MovimentacaoService) {}

  ngOnInit(): void {
    // inicializa com mês/ano atual
    const now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();

    this.loadMovimentacoes();
  }

  private loadMovimentacoes() {
    this.movService.listarMovimentacoes().subscribe({
      next: (list) => {
        this.movimentacoes = list ?? [];
        // calcula anos disponíveis e gerar relatório com filtros atuais
        this.computeAvailableYears();
        this.gerarRelatorio();
      },
      error: () => {
        this.movimentacoes = [];
        this.filteredMovimentacoes = [];
        this.totais = { entradas: 0, saidas: 0 };
      }
    });
  }

  private computeAvailableYears() {
    const years = new Set<number>();
    for (const mov of this.movimentacoes) {
      const d = this.parseMovDate(mov);
      if (d) years.add(d.getFullYear());
    }
    // converte para array e ordena desc (mais recente primeiro)
    this.availableYears = Array.from(years).sort((a, b) => b - a);

    // se não houver ano selecionado, escolhe o primeiro disponível (mais recente)
    if ((this.year === null || this.year === undefined) && this.availableYears.length > 0) {
      this.year = this.availableYears[0];
    }
  }

  gerarRelatorio() {
    // decide intervalo com base em reportType
    const year = this.year ?? new Date().getFullYear();
    let month = this.month ?? (new Date().getMonth() + 1);

    const filtered = (this.movimentacoes ?? []).filter(mov => {
      const d = this.parseMovDate(mov);
      if (!d) return false;
      if (this.reportType === 'annual') {
        return d.getFullYear() === year;
      }
      // mensal
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    // ordenar por data desc
    filtered.sort((a, b) => {
      const da = this.parseMovDate(a); const db = this.parseMovDate(b);
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    });

    this.filteredMovimentacoes = filtered;
    this.calculateTotals();
  }

  public parseMovDate(mov: any): Date | null {
    const raw = mov.data ?? mov.dataHora ?? mov.data_movimentacao ?? mov.timestamp ?? mov.createdAt;
    if (!raw) return null;
    // tenta criar Date direto (ISO)
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;

    // tenta dd/MM/yyyy ou dd/MM/yyyy HH:mm
    const s = String(raw).trim();
    const dateTimeParts = s.split(' ');
    const datePart = dateTimeParts[0];
    const parts = datePart.split('/');
    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const hhmm = dateTimeParts[1] ?? '00:00';
        const [hh, mm] = hhmm.split(':').map(p => Number(p) || 0);
        return new Date(year, month - 1, day, hh, mm);
      }
    }

    return null;
  }

  private calculateTotals() {
    let entradas = 0; let saidas = 0;
    for (const mov of this.filteredMovimentacoes) {
      const rawQty = mov.quantidade ?? mov.qtd ?? mov.amount ?? 0;
      const rawNum = Number(rawQty);
      const absQty = Math.abs(isNaN(rawNum) ? 0 : rawNum);

      // Usa helper getTipoLabel para decidir: suporta string (ex: 'entrada', 'E'),
      // ou códigos numéricos (1 = entrada, 2 = saída).
      const tipoLabel = this.getTipoLabel(mov);
      if (tipoLabel === 'Entrada') entradas += absQty; else saidas += absQty;
    }
    this.totais = { entradas, saidas };
  }

  // Retorna 'Entrada' ou 'Saída' a partir do objeto de movimentação
  public getTipoLabel(mov: any): 'Entrada' | 'Saída' {
    const t = mov.tipo ?? mov.tipoMovimentacao ?? mov.tipo_movimentacao ?? mov.tipoCodigo ?? mov.tipo_codigo ?? mov.code ?? mov.codigo;
    if (t === undefined || t === null) {
      // fallback para sinal
      const q = Number(mov.quantidade ?? mov.qtd ?? mov.amount ?? 0);
      return (!isNaN(q) && q < 0) ? 'Saída' : 'Entrada';
    }

    // se for número (ou string numérica)
    const tn = Number(t);
    if (!isNaN(tn)) {
      if (tn === 1) return 'Entrada';
      if (tn === 2) return 'Saída';
      // para outros códigos numéricos, usa sinal como fallback
      const q = Number(mov.quantidade ?? mov.qtd ?? mov.amount ?? 0);
      return (!isNaN(q) && q < 0) ? 'Saída' : 'Entrada';
    }

    // se for texto, normaliza
    const ts = String(t).toLowerCase();
    if (ts.startsWith('e') || ts.includes('entr') || ts.includes('in')) return 'Entrada';
    if (ts.startsWith('s') || ts.includes('sai') || ts.includes('out')) return 'Saída';

    // fallback final: usa sinal
    const q = Number(mov.quantidade ?? mov.qtd ?? mov.amount ?? 0);
    return (!isNaN(q) && q < 0) ? 'Saída' : 'Entrada';
  }

  exportarCSV() {
    // Helper: escape field for CSV (double quotes and wrap)
    const escape = (v: any) => {
      if (v === null || v === undefined) return '""';
      const s = String(v).replace(/\r?\n/g, ' ').replace(/"/g, '""');
      return '"' + s + '"';
    };

    const rows: Array<Array<string>> = [];
    rows.push(['Data', 'Material', 'Tipo', 'Quantidade']);

    for (const mov of this.filteredMovimentacoes) {
      const d = this.parseMovDate(mov);
  // format date only (no time)
  const dateStr = d ? d.toLocaleDateString() : String(mov.data ?? mov.dataHora ?? '');
      const material = mov.materialNome ?? mov.material ?? mov.material_id ?? '';
      const tipo = this.getTipoLabel(mov);
      const rawQty = mov.quantidade ?? mov.qtd ?? mov.amount ?? '';
      const qtd = (rawQty === null || rawQty === undefined) ? '' : String(rawQty);
      rows.push([dateStr, String(material), tipo, qtd]);
    }

  // add totals row (keep same number of columns: 4)
  const entradas = this.totais?.entradas ?? 0;
  const saidas = this.totais?.saidas ?? 0;
  rows.push(['', '', '', '']); // empty row with 4 columns
  rows.push(['', 'Totais', '', `Entradas: ${entradas} | Saídas: ${saidas}`]);

  // Use semicolon as separator (common for PT-BR Excel). Build CSV with CRLF and UTF-8 BOM.
  const sep = ';';
  const csvContent = '\uFEFF' + rows.map(r => r.map(c => escape(c)).join(sep)).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const monthPart = this.reportType === 'monthly' ? `_${String(this.month ?? '')}` : '';
    const filename = `relatorio_movimentacoes_${this.reportType}_${this.year ?? ''}${monthPart}_${timestamp}.csv`;

    // download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
