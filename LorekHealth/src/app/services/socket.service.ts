import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SocketService {
  config: SocketIoConfig = { url: 'http://localhost:5000/myhub', options: {} };

  constructor(private socket: Socket) {
    this.socket = new Socket(this.config);
  }

  // Nasłuchiwanie na zdarzenie z serwera
  getMessage(): Observable<any> {
    return this.socket.fromEvent<any>('my_response');
  }

  // Wysyłanie zdarzenia do serwera
  sendMessage(data: any): void {
    this.socket.emit('my_event', data);
  }

  // Opcjonalnie, metoda do obsługi połączenia
  connect() {
    this.socket.connect();
  }

  // Opcjonalnie, metoda do obsługi rozłączenia
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}