import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient;

  #currentUser = signal<any | null>(null);
  
  constructor(http: HttpClient) {
    this.http = http;
    this.checkAuthStatus();
    
    const token = localStorage.getItem('token_access');
    if (token) {
      this.#currentUser.set({ token });
    } 
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token_access');
    if (token) {
      this.#currentUser.set({ token });
    } else {
      this.#currentUser.set(null);
    }
  }
  
  public readonly currentUser = this.#currentUser.asReadonly();
  
  public isAuthenticated = computed(() => !!this.#currentUser());

  public login(credentials: any) {
    return this.http.post<any>('https://tu-api.com/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('token_access', response.token);
        this.#currentUser.set(response.user);
      })
    );
  }

  public logout() {
    localStorage.removeItem('token_access');
    this.#currentUser.set(null);
  }
}
