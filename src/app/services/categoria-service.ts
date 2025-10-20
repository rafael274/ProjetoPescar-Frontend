import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  listarCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categoria/listar`, { headers: this.authService.getAutheHeaders() });
  }
}
