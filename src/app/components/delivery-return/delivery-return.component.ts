import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/orders.service';
import { orders } from '../../models/orders';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-return',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivery-return.component.html',
  styleUrls: ['./delivery-return.component.css']
})
export class DeliveryReturnComponent implements OnInit {
  orders: orders[] = [];
  selectedOrders: orders[] = [];
  returnForm: FormGroup;

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder
  ) {
    this.returnForm = this.fb.group({
      entregador: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
  const entregadorName = this.returnForm.get('entregador')?.value?.toLowerCase(); // Converter o nome do entregador para lowercase

  if (!entregadorName) {
    // Não realizar a busca se o nome do entregador não for preenchido
    return;
  }

  this.orderService.getOrders().subscribe((orders) => {
    // Filtrar pedidos com status 3 e que correspondem ao nome do entregador (case insensitive)
    this.orders = orders.filter(order => order.status === 3 && order.entregador?.toLowerCase() === entregadorName);

    if (this.orders.length === 0) {
      // Apenas se não houver pedidos, exibir o alerta
      alert('Nenhum pedido encontrado para este entregador.');
    }
  });
}

  onOrderSelectionChange(order: orders, event: any): void {
    if (event.target.checked) {
      this.selectedOrders.push(order);
    } else {
      this.selectedOrders = this.selectedOrders.filter(o => o !== order);
    }
  }

  confirmReturn(): void {
    if (this.selectedOrders.length === 0) {
      alert('Nenhum pedido selecionado');
      return;
    }

    const entregador = this.returnForm.get('entregador')?.value || '';  // Nome do entregador

    this.selectedOrders.forEach((order) => {
      let notes = order.observacao || '';  // Pegar a observação existente, se houver

      // Se quiser concatenar uma nova observação, você pode fazer isso aqui:
      // notes += ' - Pedido retornado pelo entregador: ' + entregador;

      const deliveryType = 4; // Status de retorno

      // Atualizar o status para 4 (Retorno)
      this.orderService.updateOrderStatus(order.id, deliveryType, entregador, notes).subscribe(() => {
        // Recarregar os pedidos sem limpar o entregador
        this.loadOrders();
      });
    });

    // Limpar apenas os pedidos selecionados, não o nome do entregador
    this.selectedOrders = [];
    alert('Obrigado por confirmar o retorno da rota');
    window.location.href = '/entrega'; // Redirecionar para a página de delivery
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

}

