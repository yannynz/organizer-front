import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { orders } from '../models/orders';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(private socket: Socket) {}

  getOrders(): Observable<orders[]> {
    return this.socket.fromEvent<orders[]>('orders');
  }

  sendOrderUpdate(order: orders): void {
    this.socket.emit('updateOrder', order);
  }
}
