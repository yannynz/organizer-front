import { Routes } from '@angular/router';
import { OrdersComponent } from './components/orders/orders.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
export const routes: Routes = [
    { path: 'pedidos', component:OrdersComponent},
    { path: 'entrega', component:DeliveryComponent},
    { path: '', redirectTo: '/pedidos', pathMatch: 'full' }
];
