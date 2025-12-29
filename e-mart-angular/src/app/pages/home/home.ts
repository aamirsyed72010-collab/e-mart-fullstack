import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="product-grid">
      @if (products$ | async; as products) {
        @for (product of products; track product.id) {
          <app-product-card [product]="product" (add)="cartService.addToCart($event)"></app-product-card>
        } @empty {
             <p>No products found.</p>
        }
      } @else {
         <p>Loading products...</p>
      }
    </div>
  `,
  styles: [`
    .product-grid { display: flex; flex-wrap: wrap; justify-content: center; padding: 20px; }
  `]
})
export class HomeComponent {
  productService = inject(ProductService);
  cartService = inject(CartService);
  products$ = this.productService.getProducts();
}
