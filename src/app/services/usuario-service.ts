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
}
