import { Categoria } from './categoria.model';

export interface Material {
  id?: string;
  nome?: string;
  descricao?: string;
  quantidade?: number;
  estoqueMinimo?: number;

  // quando enviamos/recebemos, a API pode usar categoriaId ou um objeto categoria
  categoriaId?: string | null;
  categoria?: Categoria | string | null;

  // aceita propriedades extras (ex.: Nome, Quantidade, estruturas diferentes da API)
  [key: string]: any;
}
