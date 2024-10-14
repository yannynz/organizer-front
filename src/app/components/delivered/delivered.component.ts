import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
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
      nr: ['', Validators.required],
      cliente: ['', Validators.required],
      prioridade: ['', Validators.required], 
      status: ['', Validators.required],
      entregador: [''],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupWebSocket();  
  }

  loadOrders(): void {
    const searchQuery = this.returnForm.get('search')?.value?.toLowerCase();
    this.orderService.getOrders().subscribe((orders) => {
      orders.sort((a, b) => {
        const dateA = new Date(a.dataH || 0).getTime();
        const dateB = new Date(b.dataH || 0).getTime();
        return dateB - dateA;
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
    });
  }

  openOrderDetails(order: orders): void {
    this.selectedOrder = order;
    this.editOrderForm.patchValue(order); 
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

  getStatusDescription(status: number): string {
  switch (status) {
    case 0:
      return 'Em Produção';
    case 3:
      return 'Saiu para Entrega';
    case 4:
      return 'Retirada';
    case 5:
      return 'Entregue';
    default:
      return 'Desconhecido'; // Valor padrão para status não reconhecidos
  }
}
  
updateOrder(): void {
  if (this.editOrderForm.valid) {
    const originalOrder = this.orders.find(order => order.id === this.editOrderForm.value.id);

    if (originalOrder) {
      // Atualizar os campos editáveis e preservar os campos que não foram modificados
      const updatedOrder = {
        ...originalOrder,  // Mantém os valores originais
        ...this.editOrderForm.value,  // Atualiza apenas os valores modificados
        dataH: originalOrder.dataH,  // Preserva o campo dataH
        entregador: this.editOrderForm.value.entregador !== undefined ? this.editOrderForm.value.entregador : originalOrder.entregador,  // Preserva entregador se não for definido
        observacao: this.editOrderForm.value.observacao !== undefined && this.editOrderForm.value.observacao !== '' 
                      ? this.editOrderForm.value.observacao 
                      : originalOrder.observacao  // Preserva observacao se estiver vazia ou indefinida
      };

      // Chamar o serviço para atualizar o pedido
      this.orderService.updateOrder(updatedOrder.id, updatedOrder).subscribe(() => {
        const index = this.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;  // Atualiza o pedido na lista
        }
        this.closeOrderDetails();  // Fecha o modal após a atualização
      });
    }
  }
}
}
