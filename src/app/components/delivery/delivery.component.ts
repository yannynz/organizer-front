import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/orders.service';
import { orders } from '../../models/orders';
import { WebsocketService } from '../../services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
})
export class DeliveryComponent implements OnInit, AfterViewInit {
  orders: orders[] = [];
  selectedOrders: orders[] = [];
  deliveryForm: FormGroup;

  @ViewChild('deliveryModal') deliveryModal!: ElementRef;
  @ViewChild('thankYouModal') thankYouModal!: ElementRef;

  private deliveryModalInstance: any;
  private thankYouModalInstance: any;

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private websocketService: WebsocketService
  ) {
    this.deliveryForm = this.fb.group({
      deliveryPerson: ['', Validators.required],
      notes: [''],
      deliveryType: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.listenForNewOrders();
  }

  ngAfterViewInit(): void {
    this.initializeModals();
  }

  initializeModals() {
    this.deliveryModalInstance = new (window as any).bootstrap.Modal(this.deliveryModal.nativeElement);
    this.thankYouModalInstance = new (window as any).bootstrap.Modal(this.thankYouModal.nativeElement);
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe((orders) => {
      this.orders = orders.filter(order => [0, 1, 2].includes(order.status))
                          .sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    });
  }

  listenForNewOrders(): void {
    this.websocketService.watchOrders().subscribe((message: any) => {
      const order = JSON.parse(message.body);
      this.updateOrdersList(order);
    });
  }

  updateOrdersList(order: orders) {
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    } else {
      this.orders.push(order);
    }
    this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    this.selectedOrders = [];
  this.closeModalsIfNeeded();
  }

  closeModalsIfNeeded() {
  if (this.deliveryModalInstance && this.deliveryModalInstance._isShown) {
    this.deliveryModalInstance.hide();
  }
  if (this.thankYouModalInstance && this.thankYouModalInstance._isShown) {
    this.thankYouModalInstance.hide();
  }
}

  onOrderSelectionChange(order: orders, event: any): void {
    if (event.target.checked) {
      this.selectedOrders.push(order);
    } else {
      this.selectedOrders = this.selectedOrders.filter(o => o !== order);
    }
  }

  preConfirmDelivery(): void {
    if (this.selectedOrders.length === 0) {
      alert('Nenhum pedido selecionado');
    } else {
      this.deliveryForm.reset();
      this.deliveryModalInstance.show();
    }
  }

  confirmDelivery(): void {
    if (this.deliveryForm.invalid) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const deliveryPerson = this.deliveryForm.get('deliveryPerson')?.value;
    const notes = this.deliveryForm.get('notes')?.value;
    const deliveryType = this.deliveryForm.get('deliveryType')?.value;

    this.selectedOrders.forEach((order) => {
      this.orderService.updateOrderStatus(order.id, deliveryType, deliveryPerson, notes).subscribe(() => {
        this.loadOrders();
      });
    });
    this.selectedOrders = [];
    this.deliveryModalInstance.hide();
    this.thankYouModalInstance.show();
  }

  closeThankYouModal(): void {
    this.thankYouModalInstance.hide();
  }

  comparePriorities(priorityA: string, priorityB: string) {
    const priorities = ['Vermelho', 'Amarelo', 'Azul', 'Verde'];
    return priorities.indexOf(priorityA) - priorities.indexOf(priorityB);
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

