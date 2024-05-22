import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VitalsComponent } from '../../components/vitals/vitals.component';
import { UserListenerComponent } from '../../components/user-listener/user-listener.component';
import { FolowUserDetailsComponent } from '../../components/folow-user-details/folow-user-details.component';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VitalsComponent,
    UserListenerComponent,
    FolowUserDetailsComponent,
  ],
})
export class DashboardComponent {
  user: any;
  messages: any[] = [];
  private messageSubscription: Subscription;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService
  ) {

    this.socketService.initializeSocket(this.apiService.getUsername()!)
    this.messageSubscription = this.socketService.getMessage().subscribe({
      next: (message) => {
        this.messages.push(message);
      },
      error: (error) => console.error(error),
    });
  }

  sendMessage(): void {
    this.socketService.sendMessage({ data: 'Hello from Angular' });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
    this.socketService.disconnect();
  }

  getUsername() {
    return this.apiService.getUsername();
  }
}
