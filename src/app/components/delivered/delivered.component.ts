import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderService } from '../../services/orders.service';
import { orders } from '../../models/orders';
import { WebsocketService } from '../../services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivered',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.css']
})
export class DeliveredComponent implements OnInit {
  orders: orders[] = [];
  filteredOrders: orders[] = [];
  selectedOrder: orders | null = null;
  editOrderForm: FormGroup;
  returnForm: FormGroup;
  currentPage = 1;
  totalPages = 1;
  pageSize = 15;  // Número de pedidos por página
  pages: number[] = [];

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private websocketService: WebsocketService
  ) {
    this.returnForm = this.fb.group({
      search: ['']
    });
    this.editOrderForm = this.fb.group({
      id: [''],
      nr: [''],
      cliente: [''],
      prioridade: [''],
      status: [''],
      entregador: [''],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupWebSocket();  // Integração com WebSocket
  }

loadOrders(): void {
  const searchQuery = this.returnForm.get('search')?.value?.toLowerCase();
  this.orderService.getOrders().subscribe((orders) => {
    // Ordenar os pedidos pela data de criação (dataH), do mais recente para o mais antigo
    orders.sort((a, b) => {
      const dateA = new Date(a.dataH || 0).getTime();
      const dateB = new Date(b.dataH || 0).getTime();
      return dateB - dateA;  // Exibir o mais recente primeiro
    });

    if (searchQuery) {
      this.orders = orders.filter(order =>
        order.id.toString().includes(searchQuery) ||
        order.nr.toLowerCase().includes(searchQuery) ||
        order.cliente.toLowerCase().includes(searchQuery) ||
        order.prioridade.toLowerCase().includes(searchQuery) ||
        (order.dataH ? order.dataH.toString().includes(searchQuery) : false) ||
        (order.entregador ? order.entregador.toLowerCase().includes(searchQuery) : false) ||
        (order.observacao ? order.observacao.toLowerCase().includes(searchQuery) : false)
      );
    } else {
      this.orders = orders;
    }

    this.updatePagination();  // Atualiza a paginação com os pedidos ordenados
  });
}
 
setupWebSocket(): void {
  this.websocketService.watchOrders().subscribe((message) => {
    const updatedOrder: orders = JSON.parse(message.body);
    const orderIndex = this.orders.findIndex(order => order.id === updatedOrder.id);

    if (orderIndex !== -1) {
      this.orders[orderIndex] = updatedOrder;  // Atualiza o pedido existente
    } else {
      this.orders.push(updatedOrder);  // Adiciona um novo pedido
    }

    // Ordenar os pedidos após a atualização pela dataH (data de criação)
    this.orders.sort((a, b) => {
      const dateA = new Date(a.dataH || 0).getTime();
      const dateB = new Date(b.dataH || 0).getTime();
      return dateB - dateA;  // Mais recente primeiro
    });

    this.updatePagination();  // Atualiza a paginação
  });
}

  updatePagination(): void {
    this.totalPages = Math.ceil(this.orders.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.filteredOrders = this.paginateOrders();
  }

paginateOrders(): orders[] {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  return this.orders.slice(start, end);  // Paginar a lista ordenada
}

goToPage(page: number): void {
  this.currentPage = page;
  this.filteredOrders = this.paginateOrders();
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.filteredOrders = this.paginateOrders();
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.filteredOrders = this.paginateOrders();
  }
}

  openOrderDetails(order: orders): void {
    this.selectedOrder = order;
    this.editOrderForm.patchValue({
      id: order.id,
      nr: order.nr,
      cliente: order.cliente,
      prioridade: order.prioridade,
      status: order.status,
      entregador: order.entregador,
      observacao: order.observacao
    });
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  getPriorityColor(prioridade: string): string {
    const colors: { [key: string]: string } = {
      'Vermelho': 'red',
      'Amarelo': 'orange',
      'Azul': 'blue',
      'Verde': 'green'
    };
    return colors[prioridade] || 'black';
  }

  updateOrder(): void {
    if (this.editOrderForm.valid) {
      const updatedOrder = this.editOrderForm.value;
      this.orderService.updateOrder(updatedOrder.id, updatedOrder).subscribe(() => {
        // Atualiza o pedido na lista
        const index = this.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.updatePagination();
        }
        this.closeOrderDetails();
      });
    }
  }
}

