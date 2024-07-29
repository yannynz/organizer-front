import { Routes } from '@angular/router';
import { OrdersComponent } from './components/orders/orders.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { DeliveredComponent } from './components/delivered/delivered.component';
export const routes: Routes = [
    { path: 'pedidos', component:OrdersComponent},
    { path: 'entrega', component:DeliveryComponent},
    { path: 'entregues', component:DeliveredComponent},
    { path: '', redirectTo: '/pedidos', pathMatch: 'full' }
];
