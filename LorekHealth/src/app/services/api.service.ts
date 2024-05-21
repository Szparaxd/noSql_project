import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000'

  constructor(private http: HttpClient,
    private router: Router
  ) { }

  registerUser(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/register`;
    return this.http.post(url, { username, password });
  }

  loginUser(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    return this.http.post<{ message: string, user_id: string }>(url, { username, password }).pipe(
      catchError((error) => {
        console.error('Login failed', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  handleAuthentication(username: string, user_id: string) {
    console.log('Login successful');
    localStorage.setItem('user', JSON.stringify({ username, user_id }));
    this.router.navigate(['/dashboard']);
  }

  registerVitals(username: string, pulse: number | null, heartRate: number | null, temperature: number | null): Observable<any> {
    const url = `${this.baseUrl}/register_vitals`;
    return this.http.post(url, {
      username,
      pulse,
      heart_rate: heartRate,
      temperature
    });
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUsername(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.username : null;
  }

  getUserId(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.user_id : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}
