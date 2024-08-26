import { Injectable, OnDestroy } from '@angular/core';
import { Client, IStompSocket } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private stompClient: Client = new Client(); // Mantenha como 'private'
  private socketUrl = 'http://localhost:8080/ws';
  public msg: any[] = [];

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection() {
    this.stompClient.webSocketFactory = () => new SockJS(this.socketUrl) as IStompSocket;
    this.stompClient.connectHeaders = {};
    this.stompClient.debug = (str) => {
      console.log('STOMP Debug: ' + str);
    };
    this.stompClient.reconnectDelay = 5000;
    this.stompClient.heartbeatIncoming = 4000;
    this.stompClient.heartbeatOutgoing = 4000;

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.onConnect();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error: ', frame);
    };

    this.stompClient.activate();
  }

  public onConnect() {
    this.stompClient.subscribe('/topic/orders', (message) => {
      if (message.body) {
        this.msg.push(message.body);
      }
    });
  }

  public sendMessage(message: string) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination: '/app/send/message', body: message });
    } else {
      console.error('STOMP client is not connected.');
    }
  }

  public disconnect() {
    if (this.stompClient) {
      console.log('Deactivating STOMP client');
      this.stompClient.deactivate();
    }
  }

  public getClient() {
    return this.stompClient;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
