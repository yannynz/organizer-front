import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/orders.service';
import { orders } from '../../models/orders';
import { WebsocketService } from '../../services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
})
export class DeliveryComponent implements OnInit {
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
    // Inicializar os modais após os elementos do DOM estarem prontos
    this.initializeModals();
  }

  initializeModals() {
    if (this.deliveryModal) {
      this.deliveryModalInstance = new (window as any).bootstrap.Modal(this.deliveryModal.nativeElement);
      console.log('Delivery Modal initialized:', this.deliveryModalInstance);
    }

    if (this.thankYouModal) {
      this.thankYouModalInstance = new (window as any).bootstrap.Modal(this.thankYouModal.nativeElement);
      console.log('Thank You Modal initialized:', this.thankYouModalInstance);
    }
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe((orders) => {
      this.orders = orders
        .filter((order) => order.status === 0 || order.status === 1 || order.status === 2)
        .sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    });
  }

  listenForNewOrders(): void {
    this.websocketService.watchOrders().subscribe((order) => {
      this.orders.push(order);
      this.orders.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    });
  }

  onOrderSelectionChange(order: orders, event: any): void {
    if (event.target.checked) {
      this.selectedOrders.push(order);
    } else {
      this.selectedOrders = this.selectedOrders.filter((o) => o !== order);
    }
  }

  preConfirmDelivery(): void {
    if (this.selectedOrders.length === 0) {
      alert('Nenhum pedido selecionado');
    } else {
      this.deliveryForm.reset();
      console.log('Opening Delivery Modal');
      this.deliveryModalInstance.show(); // Mostrar modal de entrega
    }
  }

  confirmDelivery(): void {
    if (this.deliveryForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
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

    this.deliveryModalInstance.hide(); // Fechar modal de entrega
    this.thankYouModalInstance.show(); // Mostrar modal de agradecimento
  }

  closeThankYouModal(): void {
    this.thankYouModalInstance.hide();
  }

  comparePriorities(priorityA: string, priorityB: string) {
    const priorities = ['Vermelho', 'Amarelo', 'Azul', 'Verde'];
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

