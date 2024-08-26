import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { orders } from '../../models/orders';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval, switchMap, timer } from 'rxjs';
import { WebSocketService } from '../../services/websocket.service';


enum Prioridade {
  Vermelho = 1,
  Amarelo = 2,
  Azul = 3,
  Verde = 4,
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})

export class OrdersComponent implements OnInit {
  orders: orders[] = [];
  createOrderForm: FormGroup;
  editOrderForm: FormGroup;
  editingOrder: orders | undefined;

  constructor(private service: OrdersService, private fb: FormBuilder, private webSocketService: WebSocketService) {
    this.createOrderForm = this.fb.group({
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataH: [new Date(), Validators.required],
    });

    this.editOrderForm = this.fb.group({
      id: [''],
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataH: [new Date(), Validators.required],
    });
  }

  ngOnInit() {
    this.initializePage();
    const stompClient = this.webSocketService.getClient();
    stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      stompClient.subscribe('/topic/orders', (message) => {
        if (message.body) {
          this.handleWebSocketMessage(message.body);
        }
      });
    };
  }
  
  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  sendMessage(message: string) {
    this.webSocketService.sendMessage(message);
  }

  initializePage(): void {
    this.selecionar().subscribe(() => {
    });
  }

  private handleWebSocketMessage(message: string): void {
    const updatedOrder = JSON.parse(message) as orders;
    const existingOrderIndex = this.orders.findIndex(order => order.id === updatedOrder.id);

    if (existingOrderIndex >= 0) {
      this.orders[existingOrderIndex] = updatedOrder;
    } else {
      this.orders.push(updatedOrder);
    }

    this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
  }

  selecionar() {
    return this.service.getOrders().pipe(
      switchMap((retorno) => {
        this.orders = retorno
          .filter(order => order.status !== 1)
          .sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
        return [];
      })
    );
  }

  private comparePriorities(prioridadeA: string, prioridadeB: string): number {
    const priorityOrder = Prioridade;
    const priorityA = priorityOrder[prioridadeA as keyof typeof priorityOrder] ?? Infinity;
    const priorityB = priorityOrder[prioridadeB as keyof typeof priorityOrder] ?? Infinity;

    return priorityA - priorityB;
  }


  delete(id: number): void {
    this.service.deleteOrder(id).subscribe({
      next: () => {
        console.log(`Pedido com ID ${id} excluído com sucesso.`);
        this.selecionar();
      },
      error: (err) => {
        console.error('Erro ao deletar o pedido:', err);
      }
    });
  }

  createOrder(): void {
    if (this.createOrderForm.valid) {
      // Formatar a data
      const formattedDataH = this.formatDateForBackend(this.createOrderForm.value.dataH);
      const orderToCreate = { ...this.createOrderForm.value, dataH: formattedDataH };

      console.log('Dados do pedido a serem enviados para o backend:', orderToCreate);

      this.service.createOrder(orderToCreate).subscribe({
        next: (createdOrder) => {
          console.log('Pedido criado com sucesso:', createdOrder);
          this.selecionar();
          this.createOrderForm.reset();
          this.closeModal('createOrderModal');
        },
        error: (err) => {
          console.error('Erro ao criar o pedido:', err);
        }
      });
    }
  }

  updateOrder(): void {
    if (this.editOrderForm.valid) {
      const formattedDataH = this.formatDateForBackend(this.editOrderForm.value.dataH);
      const orderToUpdate = { ...this.editOrderForm.value, dataH: formattedDataH };
      const id = this.editOrderForm.value.id;

      this.service.updateOrder(id, orderToUpdate).subscribe({
        next: () => {
          this.selecionar();
          this.editingOrder = undefined;
          this.closeModal('editOrderModal');
        },
        error: (err) => {
          console.error('Erro ao atualizar o pedido:', err);
        }
      });
    }
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
