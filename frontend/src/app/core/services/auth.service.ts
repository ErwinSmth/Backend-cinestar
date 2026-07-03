import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface DecodedToken {
  sub: string;
  userId?: number;
  groups?: string[];
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';
  private readonly TOKEN_KEY = 'auth-token';

  // Reactive state using Signals
  isAuthenticated = signal<boolean>(false);
  currentUserEmail = signal<string | null>(null);
  currentUserId = signal<number | null>(null);
  currentUserRoles = signal<string[]>([]);

  constructor(private http: HttpClient) {
    this.checkInitialToken();
  }

  private checkInitialToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.decodeAndSetToken(token);
    }
  }

  private decodeAndSetToken(token: string): void {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Check expiration
      if (decoded.exp * 1000 < Date.now()) {
        this.logout();
        return;
      }

      localStorage.setItem(this.TOKEN_KEY, token);
      this.isAuthenticated.set(true);
      this.currentUserEmail.set(decoded.sub);
      this.currentUserId.set(decoded.userId || null);
      this.currentUserRoles.set(decoded.groups || []);
    } catch (error) {
      console.error('Error decoding token', error);
      this.logout();
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.decodeAndSetToken(response.token);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, userData).pipe(
      tap(response => {
        if (response.token) {
          this.decodeAndSetToken(response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.currentUserEmail.set(null);
    this.currentUserId.set(null);
    this.currentUserRoles.set([]);
  }

  getUserEmail(): string | null {
    return this.currentUserEmail();
  }

  getUserId(): number | null {
    return this.currentUserId();
  }

  getRoles(): string[] {
    return this.currentUserRoles();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUserRoles().includes('ROLE_ADMINISTRADOR');
  }

  isTaquillero(): boolean {
    return this.currentUserRoles().includes('ROLE_TAQUILLERO');
  }
}
