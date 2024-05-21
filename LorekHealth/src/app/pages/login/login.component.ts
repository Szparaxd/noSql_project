import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.apiService.loginUser(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe({
          next: ({ message, user_id }) => {
            this.successMessage = message;
            this.apiService.handleAuthentication(this.loginForm.value.username, user_id);
          },
          error: (error) => {
            this.errorMessage = error.message || 'An error occurred during login.';
          }
        });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);  // Adjust the route as necessary
  }
}
