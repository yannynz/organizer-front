import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrdersComponent } from "./components/orders/orders.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OrdersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'organizer-front';

  showFooter: boolean = true;
}
