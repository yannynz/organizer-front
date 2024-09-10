import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RxStompService } from '@stomp/ng2-stompjs';
import { RxStompConfig } from '@stomp/rx-stomp';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private rxStompService: RxStompService;

  constructor() {
    this.rxStompService = new RxStompService();
    this.rxStompService.configure(this.myRxStompConfig());
    this.rxStompService.activate();
  }

  private myRxStompConfig(): RxStompConfig {
    return {
      brokerURL: 'ws://localhost:8080/ws/orders',
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 200,
      debug: (msg: string): void => {
        console.log(new Date(), msg);
      },
    };
  }

  public watchOrders(): Observable<any> {
    return this.rxStompService.watch('/topic/orders');
  }
 // Envia um pedido para criação via WebSocket
  public sendCreateOrder(order: any): void {
    this.rxStompService.publish({ destination: '/app/orders/create', body: JSON.stringify(order) });
  }

  public sendUpdateOrder(order: any): void {
    this.rxStompService.publish({ destination: '/app/orders/update', body: JSON.stringify(order) });
  }

  public sendDeleteOrder(orderId: number): void {
    this.rxStompService.publish({ destination: `/orders/delete/${orderId}` });
  }
}
