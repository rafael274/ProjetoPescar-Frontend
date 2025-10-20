export interface Categoria {
  id?: string;
  nome?: string;
  descricao?: string;
  // outros campos opcionais da categoria, se houver
  [key: string]: any;
}
