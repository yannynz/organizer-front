import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/orders.service';
import { orders } from '../../models/orders';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivered',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.css'],
})
 export class DeliveredComponent  {}
//   orders: orders[] = [];
//   paginatedOrders: orders[] = [];
//   searchTerm: string = '';
//   currentPage: number = 1;
//   pageSize: number = 10;
//   totalPages: number = 1;
//   pageNumbers: number[] = [];
//   reloadInterval: any;

//   constructor(private orderService: OrdersService) {}

//   ngOnInit(): void {
//     this.loadOrders();

//   }

//   ngOnDestroy(): void {
//     clearInterval(this.reloadInterval);
//   }

//   loadOrders(): void {
//     this.orderService.getDeliveredOrders().subscribe((data) => {
//       this.orders = data
//         .filter((order) => order.status === 1)
//         .map((order) => ({ ...order, isOpen: false }));
//       this.searchOrders();
//       this.calculatePagination();
//     });
//   }

//   calculatePagination(): void {
//     const itemsPerPage = this.pageSize;
//     this.totalPages = Math.ceil(this.orders.length / itemsPerPage);
//     this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
//     this.paginateOrders();
//   }

//   paginateOrders(): void {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     const endIndex = startIndex + this.pageSize;
//     this.paginatedOrders = this.orders.slice(startIndex, endIndex);
//   }

//   changePage(page: number): void {
//     if (page < 1 || page > this.totalPages) return;
//     this.currentPage = page;
//     this.orders.forEach((order) => (order.isOpen = false));
//     this.paginateOrders();
//   }

//   searchOrders(): void {
//     this.currentPage = 1;
//     const searchTermLower = this.searchTerm.toLowerCase();
//     this.orders = this.orders.filter(
//       (order) =>
//         order.nr.toLowerCase().includes(searchTermLower) ||
//         order.cliente.toLowerCase().includes(searchTermLower) ||
//         order.id.toString().includes(this.searchTerm)
//     );
//     this.calculatePagination();
//   }

//   toggleAccordion(order: orders): void {
//     order.isOpen = !order.isOpen;
//   }
// }
