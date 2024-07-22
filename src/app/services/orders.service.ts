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

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
