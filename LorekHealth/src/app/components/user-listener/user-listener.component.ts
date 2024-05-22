import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserSearchComponent } from '../user-search/user-search.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-listener',
  standalone: true,
  templateUrl: './user-listener.component.html',
  styleUrl: './user-listener.component.css',
  imports: [UserSearchComponent, CommonModule, ReactiveFormsModule, FormsModule],
})
export class UserListenerComponent {
    followUsers: any[] = [];
    @Output() userChanged = new EventEmitter<any>();

    constructor(private apiService: ApiService) {}
  
    ngOnInit(): void {
      this.fetchFollowUsers();
    }
  
    fetchFollowUsers(): void {
      this.apiService.getFollowUsers(this.apiService.getUsername()!).subscribe(response => {
        this.followUsers = response.follow_users;
      });
    }
  
    addFollowUser(followUsername: string): void {
      this.apiService.addFollowUser(this.apiService.getUsername()!, followUsername).subscribe(() => {
        this.fetchFollowUsers(); // Refresh the follow users list after adding
      });
    }
  
    saveCriticalValues(user: any): void {
      const criticalValues = {
        critical_pulse: user.critical_pulse,
        critical_heart_rate: user.critical_heart_rate,
        critical_temperature: user.critical_temperature
      };
      this.apiService.updateCriticalValues(this.apiService.getUsername()!, user.username, criticalValues).subscribe(() => {
        // Optionally, handle the response, e.g., show a notification
      });
    }

    removeFollowUser(user: any): void {
      this.apiService.removeFollowUser(this.apiService.getUsername()!, user.username)
      .subscribe(() => {
        this.fetchFollowUsers(); // Refresh the follow users list after removing
      });
    }

    setUser(user : any){
      console.log(user.username)
      this.userChanged.emit(user);
    }
}
