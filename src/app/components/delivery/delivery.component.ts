import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { orders } from '../../models/orders';
import { CommonModule } from '@angular/common';

enum Prioridade {
  Vermelho = 1,
  Amarelo = 2,
  Azul = 3,
  Verde = 4,
}
@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
})

export class DeliveryComponent implements OnInit {
  orders: orders[] = [];
  selectedOrders: orders[] = [];
  deliveryForm: FormGroup;
  isModalVisible: boolean = false;
  @ViewChild('deliveryModalClose') deliveryModalClose: ElementRef | undefined;
  @ViewChild('thankYouModalClose') thankYouModalClose: ElementRef | undefined;

  constructor(private ordersService: OrdersService, private fb: FormBuilder) {
    this.deliveryForm = this.fb.group({
      deliveryPerson: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getOrders().subscribe((orders) => {
      this.orders = orders
        .filter((order) => order.status === 0)
        .sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    });
  }

  private comparePriorities(prioridadeA: string, prioridadeB: string): number {
    const priorityOrder = Prioridade;
    const priorityA = priorityOrder[prioridadeA as keyof typeof priorityOrder] ?? Infinity;
    const priorityB = priorityOrder[prioridadeB as keyof typeof priorityOrder] ?? Infinity;
    return priorityA - priorityB;
  }

  onOrderSelectionChange(order: orders, event: any): void {
    if (event.target.checked) {
      this.selectedOrders.push(order);
    } else {
      this.selectedOrders = this.selectedOrders.filter((o) => o !== order);
    }
  }

  openDeliveryModal(): void {
    this.deliveryForm.reset();
    const modal = document.getElementById('deliveryModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

closeModal(modalId: string): void {
  this.isModalVisible = false;
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
    bootstrapModal.hide();
  }
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

  preConfirmDelivery(): void {
    if (this.selectedOrders.length == 0) {
      alert('Nenhum pedido selecionado');
      return;
    } else {
      this.openDeliveryModal();
    }
  }

  confirmDelivery(): void {
    const deliveryPerson = this.deliveryForm.get('deliveryPerson')?.value;
    const notes = this.deliveryForm.get('notes')?.value;
  
    this.selectedOrders.forEach((order) => {
      this.ordersService.updateOrderStatus(order.id, 1, deliveryPerson, notes).subscribe(() => {
        this.loadOrders();
      });
    });
  
    if (this.deliveryModalClose) {
      this.deliveryModalClose.nativeElement.click();
    }

    if (this.thankYouModalClose) {
      const thankYouModal = document.getElementById('thankYouModal');
      if (thankYouModal) {
        const bootstrapModal = new (window as any).bootstrap.Modal(thankYouModal);
        bootstrapModal.show();
      }
    }
  }  
}
