import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );

  private nomeSubject = new BehaviorSubject<string | null>(null);

  setNome(nome: string) {
      this.nomeSubject.next(nome);
  }
  getNome$(): Observable<string | null> {
      return this.nomeSubject.asObservable();
  }  
  getNomeAtual(): string | null {
      return this.nomeSubject.value;
  }

  // fornece sempre o valor atual do token
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // instance token (mantido apenas por compatibilidade; prefira tokenSubject)
  token: string | null = this.tokenSubject.value;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<string>{
    return new Observable(observer => {
      this.http.post<string>(`${this.baseUrl}/autenticar`, {
        email: username,
        senha: password
      }).subscribe({
        next: (response) => {
          localStorage.setItem('token', response);
          this.tokenSubject.next(response);
          this.token = response;

          const payload = this.decodeJwtPayload(response);
          if (payload && payload.Nome) {
            this.setNome(payload.Nome);
          }

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Erro ao autenticar:', error);
          observer.error(error);
        }
      });
    });
  }

  logout(){
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean{
    const t = this.tokenSubject.value;
    // considera inválido null, undefined, string vazia ou "null"
    return !!t && t !== 'null' && t.trim() !== '';
  }

  // usa tokenSubject diretamente (sempre atual)
  getAuthHeaders(): HttpHeaders {
    const t = this.tokenSubject.value ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${t}`
    });
  }

  // alias mantido por compatibilidade com chamadas existentes
  getAutheHeaders(): HttpHeaders {
    return this.getAuthHeaders();
  }

  decodeJwtPayload(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }
}

