import { Component, Input, SimpleChanges } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-folow-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './folow-user-details.component.html',
  styleUrl: './folow-user-details.component.css',
})
export class FolowUserDetailsComponent {
  @Input() user: any;
  vitals: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchVitalsDetails();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && !changes['user'].firstChange) {
      this.fetchVitalsDetails();
    }
  }

  fetchVitalsDetails(): void {
    if (this.user) {
      this.apiService.getVitalsDetails(this.user.username).subscribe({
        next: (data) => {
          this.vitals = data;
          console.log('Vitals updated:', this.vitals);
        },
        error: (error) => console.error('Failed to fetch vitals:', error),
      });
    }
  }
}
