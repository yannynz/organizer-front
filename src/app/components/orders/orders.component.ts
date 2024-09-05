import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { orders } from '../../models/orders'; // Certifique-se de que a importação está correta para seu modelo
import { Subscription, interval } from 'rxjs';
import { WebsocketService } from '../../services/websocket.service';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: orders[] = [];
  createOrderForm: FormGroup;
  editOrderForm: FormGroup;
  editingOrder: orders | undefined;
  ordersSubscription: Subscription | undefined;

  constructor(private websocketService: WebsocketService, private fb: FormBuilder, private service: OrdersService) {
    this.createOrderForm = this.fb.group({
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataEntrega: [new Date(), Validators.required],
    });

    this.editOrderForm = this.fb.group({
      id: [''],
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataEntrega: [new Date(), Validators.required],
      status: [''],
      entregador: [''],
      observacao: [''],
    });
  }

  ngOnInit(): void {
    // Carrega os pedidos existentes no início
    this.service.getOrders().subscribe((existingOrders: orders[]) => {
      this.orders = existingOrders;
    });

    // Escuta os eventos via WebSocket
    this.websocketService.watchOrders().subscribe((message: any) => {
      const receivedMessage = JSON.parse(message.body);

      switch (receivedMessage.action) {
        case 'create':
          this.addOrder(receivedMessage.data);
          break;
        case 'update':
          this.updateOrder(receivedMessage.data);
          break;
        case 'delete':
          this.removeOrder(receivedMessage.data); // data seria o ID do pedido deletado
          break;
        default:
          console.warn('Ação desconhecida:', receivedMessage.action);
      }
    });
  }

  addOrder(newOrder: orders) {
    const index = this.orders.findIndex(o => o.id === newOrder.id);
    if (index === -1) {
      this.orders.push(newOrder);
      this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    }
  }

  updateOrder(updatedOrder: orders) {
    const index = this.orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    }
  }

  removeOrder(orderId: number) {
    this.orders = this.orders.filter(order => order.id !== orderId);
  }


  updateOrdersList(order: any) {
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    } else {
      this.orders.push(order);
    }
    this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
  }
  ngOnDestroy() {
    this.ordersSubscription?.unsubscribe();
  }

  private comparePriorities(prioridadeA: string, prioridadeB: string): number {
    const priorityOrder: { [key: string]: number } = {
      Vermelho: 1,
      Amarelo: 2,
      Azul: 3,
      Verde: 4,
    };
    const priorityA = priorityOrder[prioridadeA] ?? Infinity;
    const priorityB = priorityOrder[prioridadeB] ?? Infinity;

    return priorityA - priorityB;
  }

  openCreateOrderModal(): void {
    this.createOrderForm.reset();
    this.openModal('createOrderModal');
  }

  openEditOrderModal(order: orders): void {
    this.editingOrder = order;
    this.editOrderForm.patchValue(order);
    this.openModal('editOrderModal');
  }

  getPriorityColor(prioridade: string): string {
    switch (prioridade) {
      case 'Vermelho':
        return 'red';
      case 'Amarelo':
        return 'yellow';
      case 'Azul':
        return 'blue';
      case 'Verde':
        return 'green';
      default:
        return 'black';
    }
  }

  private formatDateForBackend(date: Date | string): string {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return date;
  }

  private openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.show();
    }
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.hide();
    }
  }
}
