import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  listarMateriais(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/material/listar`, { headers: this.authService.getAutheHeaders() });
  }

  cadastrarMaterial(material: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/material/adicionar`, material, { headers: this.authService.getAutheHeaders() });
  }

  atualizarMaterial(material: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/material/atualizar`, material, { headers: this.authService.getAutheHeaders() });
  }

  removerMaterial(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/material/remover/${id}`, { headers: this.authService.getAutheHeaders() });
  }
}
