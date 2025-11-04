import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ajusta rota para /usuario/adicionar conforme Swagger
  adicionarUsuario(usuario: Usuario): Observable<any>{
    return this.http.post<Usuario>(`${this.baseUrl}/usuario/adicionar`, usuario, { headers: this.authService.getAuthHeaders() });
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuario/listar`, { headers: this.authService.getAuthHeaders() });
  }

  atualizarUsuario(usuario: Usuario): Observable<any> {
    return this.http.put<Usuario>(`${this.baseUrl}/usuario/atualizar`, usuario, { headers: this.authService.getAuthHeaders() });
  }

  deletarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuario/remover/${id}`, { headers: this.authService.getAuthHeaders() });
  }
}