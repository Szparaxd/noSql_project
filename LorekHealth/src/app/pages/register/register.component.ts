import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registrationForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.apiService.registerUser(
        this.registrationForm.value.username,
        this.registrationForm.value.password
      ).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.router.navigate(['/login']); // Redirect to login after registration
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'An error occurred during registration.';
          console.error('Registration failed', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
