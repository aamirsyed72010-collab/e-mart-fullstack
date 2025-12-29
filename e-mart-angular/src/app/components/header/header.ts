import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatBadgeModule],
  template: `
    <mat-toolbar color="primary" class="glass-effect">
      <span>E-Mart</span>
      <span class="spacer"></span>
      <button mat-icon-button [matBadge]="cartService.totalCount()" matBadgeColor="warn">
        <mat-icon>shopping_cart</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    mat-toolbar { position: sticky; top: 0; z-index: 1000; }
  `]
})
export class HeaderComponent {
  cartService = inject(CartService);
}
