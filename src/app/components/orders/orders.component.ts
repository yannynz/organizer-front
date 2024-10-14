import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { orders } from '../../models/orders';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../services/websocket.service';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/orders.service';

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
  selectedOrder: orders | null = null; // Armazena o pedido selecionado para edição

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private websocketService: WebsocketService
  ) {
    this.createOrderForm = this.formBuilder.group({
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataEntrega: [new Date(), Validators.required],
      dataH: [''],
    });

    this.editOrderForm = this.formBuilder.group({
      id: [''],
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataEntrega: [new Date(), Validators.required],
      status: [''],
      entregador: [''],
      observacao: [''],
      dataH: ['']
    });
  }

  ngOnDestroy(): void {
    this.ordersSubscription?.unsubscribe();
  }

  ngOnInit() {
    // Inicialização dos pedidos e subscrição via WebSocket
    this.loadOrders();
    this.listenForWebSocketUpdates();
  }

 loadOrders() {
  // Carrega todos os pedidos existentes
  this.orderService.getOrders().subscribe((orders: orders[]) => {
    this.orders = orders.filter(order => order.status === 0 || order.status === 1 || order.status === 2);
    this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
  });
}

  listenForWebSocketUpdates() {
    this.websocketService.watchOrders().subscribe((message: any) => {
      const receivedOrder = JSON.parse(message.body);
      // Lógica de atualização, criação ou exclusão com base na ação
      const order = receivedOrder;
      if (receivedOrder.action === 'delete') {
        this.orders = this.orders.filter(o => o.id !== order.id);
      } else {
        this.updateOrdersList(order);
      }
    });
  }

  openCreateOrderModal() {
    // Abre o modal de criação
    this.createOrderForm.reset();
    const modal = new (window as any).bootstrap.Modal(document.getElementById('createOrderModal')!);
    modal.show();
  }

  openEditOrderModal(order: orders) {
    // Abre o modal de edição com os dados preenchidos
    this.selectedOrder = order;
    this.editOrderForm.patchValue({
      nr: order.nr,
      cliente: order.cliente,
      prioridade: order.prioridade,
      dataEntrega: order.dataEntrega
    });
    const modal = new (window as any).bootstrap.Modal(document.getElementById('editOrderModal')!);
    modal.show();
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new (window as any).bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  createOrder() {
    // Chama o serviço para criar um novo pedido
    const newOrder = this.createOrderForm.value;
    this.orderService.createOrder(newOrder).subscribe(() => {
      this.createOrderForm.reset();
      // Fecha o modal de criação
      this.closeModal('createOrderModal');
      this.loadOrders(); // Atualiza a lista de pedidos
    });
  }

  updateOrder(): void {
    if (this.editOrderForm.valid) {
      // Atualiza o pedido com os valores do formulário
      const updatedOrder = { ...this.editingOrder, ...this.editOrderForm.value };

      // Chama o serviço para atualizar o pedido
      this.orderService.updateOrder(updatedOrder.id, updatedOrder).subscribe({
        next: (response) => {
          console.log('Pedido atualizado com sucesso:', response);
          this.loadOrders(); // Atualiza a lista de pedidos
          this.editOrderForm.reset();
          this.editingOrder = undefined;
          this.closeModal('editOrderModal');
        },
        error: (err) => {
          console.error('Erro ao atualizar o pedido:', err);
        }
      });
    }
  }

  delete(orderId: number) {
    // Chama o serviço para deletar o pedido
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      this.orderService.deleteOrder(orderId).subscribe(() => {
        // Remove o pedido da lista local
        this.orders = this.orders.filter(order => order.id !== orderId);
      });
    }
  }

  updateOrdersList(order: orders) {
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = order; // Atualiza o pedido existente
    } else {
      this.orders.push(order); // Adiciona um novo pedido
    }
    // Organiza a lista de pedidos pela prioridade
    this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
  }

  comparePriorities(priorityA: string, priorityB: string) {
    const priorities = ['Vermelho', 'Amarelo', 'Azul', 'Verde']; // Corrigido
    return priorities.indexOf(priorityA) - priorities.indexOf(priorityB);
  }

  getPriorityColor(prioridade: string): string {
    switch (prioridade) {
      case 'Vermelho':
        return 'red';
      case 'Amarelo':
        return 'orange';
      case 'Azul':
        return 'blue';
      case 'Verde':
        return 'green';
      default:
        return 'black';
    }
  }
}
