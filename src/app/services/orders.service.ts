import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { orders } from '../models/orders';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private url = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<orders[]> {
    return this.http.get<orders[]>(this.url);
  }
  
  createOrder(order: orders): Observable<orders> {
    return this.http.post<orders>(this.url, order);
  }

  updateOrder(id: number, order: orders): Observable<orders> {
    return this.http.put<orders>(`${this.url}/${id}`, order);
  }
  
  updateOrderStatus(id: number, status: number, entregador: string, observacao: string): Observable<orders> {
    const url = `${this.url}/${id}/status`;
    const params = new URLSearchParams();
    params.append('status', status.toString());
    params.append('entregador', entregador);
    params.append('observacao', observacao);
  
    return this.http.put<orders>(`${url}?${params.toString()}`, null);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getDeliveredOrders(): Observable<orders[]> {
    return this.http.get<orders[]>(`${this.url}?status=1`);
  }

  searchDeliveredOrders(term: string): Observable<orders[]> {
    return this.http.get<orders[]>(`${this.url}/search?term=${term}&status=1`);
  }
}
