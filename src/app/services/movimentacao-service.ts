import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  registrarMovimentacao(payload: any): Observable<any> {
    // endpoint: ajuste se sua API usar outro caminho (ex: /movimentacao/registrar)
    return this.http.post<any>(`${this.baseUrl}/movimentacao/adicionar`, payload, { headers: this.authService.getAutheHeaders() });
  }

  listarMovimentacoes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/movimentacao/listar`, { headers: this.authService.getAutheHeaders() });
  }
}
