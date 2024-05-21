import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-search.component.html',
  styleUrl: './user-search.component.css'
})
export class UserSearchComponent {
  searchControl = new FormControl();
  suggestions: string[] = [];
  
  @Output() userSelected = new EventEmitter<string>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        if (query.length >= 3) {
          return this.apiService.searchUsers(query);
        } else {
          return [];
        }
      })
    ).subscribe(response => {
      if (response && response.usernames) {
        this.suggestions = response.usernames;
      } else {
        this.suggestions = [];
      }
    });
  }

  selectUser(username: string): void {
    this.userSelected.emit(username);
    this.suggestions = [];
    this.searchControl.setValue('');
  }
}
