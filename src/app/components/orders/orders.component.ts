import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { orders } from '../../models/orders';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private service: OrdersService, private fb: FormBuilder) {
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
    this.selecionar();
  }

  selecionar(): void {
    this.service.getOrders().subscribe((retorno) => {
      this.orders = retorno.sort((a, b) => this.comparePriorities(a.prioridade, b.prioridade));
    });
  }
  

  private comparePriorities(prioridadeA: string, prioridadeB: string): number {
    const priorityOrder = Prioridade;
  
    // Converter prioridades para valores numéricos usando o enum
    const priorityA = priorityOrder[prioridadeA as keyof typeof priorityOrder] ?? Infinity;
    const priorityB = priorityOrder[prioridadeB as keyof typeof priorityOrder] ?? Infinity;
  
    return priorityA - priorityB;
  }
  

  delete(id: number): void {
    this.service.deleteOrder(id).subscribe({
      next: () => {
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
      // Formatar a data
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
      // Formatar a data para o formato yyyy-MM-ddThh:mm
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
