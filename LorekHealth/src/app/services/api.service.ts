import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/register`;
    return this.http.post(url, { username, password });
  }

  loginUser(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    return this.http
      .post<{ message: string; user_id: string }>(url, { username, password })
      .pipe(
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

  registerVitals(
    username: string,
    pulse: number | null,
    heartRate: number | null,
    temperature: number | null
  ): Observable<any> {
    const url = `${this.baseUrl}/register_vitals`;
    return this.http.post(url, {
      username,
      pulse,
      heart_rate: heartRate,
      temperature,
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

  searchUsers(query: string): Observable<{ usernames: string[] }> {
    return this.http.get<{ usernames: string[] }>(
      `${this.baseUrl}/users/search`,
      {
        params: { query },
      }
    );
  }

  getFollowUsers(username: string): Observable<{ follow_users: any[] }> {
    return this.http.get<{ follow_users: any[] }>(
      `${this.baseUrl}/users/follow`,
      {
        params: { username },
      }
    );
  }

  addFollowUser(username: string, followUser: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/follow`, {
      username,
      follow_user: followUser,
      critical_pulse: 0,
      critical_heart_rate: 0,
      critical_temperature: 0,
    });
  }

  updateCriticalValues(
    username: string,
    followUser: string,
    criticalValues: any
  ): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/follow`, {
      username,
      follow_user: followUser,
      ...criticalValues,
    });
  }

  removeFollowUser(username: string, followUsername: string): Observable<any> {
    const url = `${this.baseUrl}/users/follow`; // Update to match the correct endpoint path
    return this.http.delete(url, {
      body: { username, follow_user: followUsername }, // Include body in delete request
    });
  }

  getVitalsDetails(username: string): Observable<any> {
    const url = `${this.baseUrl}/vitals/details?username=${username}`;
    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Failed to fetch vitals details', error);
        return throwError(() => new Error('Failed to fetch vitals details'));
      })
    );
  }

  getAlerts(follow_username: string) : Observable<any> {
    const us = this.getUsername();
    const url = `${this.baseUrl}/get_alerts?username=${us}&follow_user=${follow_username}`
    
    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Failed to fetch aletrs', error);
        return throwError(() => new Error('Failed to fetch aletrs'))
      })
    );
  }
}
