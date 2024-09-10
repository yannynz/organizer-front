import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { orders } from '../models/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:8080/api/orders'; // Ajuste com sua URL

  constructor(private http: HttpClient) {}

  getOrders(): Observable<orders[]> {
    return this.http.get<orders[]>(`${this.baseUrl}`);
  }

  createOrder(order: orders): Observable<orders> {
    return this.http.post<orders>(`${this.baseUrl}/create`, order);
  }

  updateOrder(id: number, order: orders): Observable<orders> {
    return this.http.put<orders>(`${this.baseUrl}/update/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}

