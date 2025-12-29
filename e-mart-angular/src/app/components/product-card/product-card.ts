import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../services/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="product-card">
      <img mat-card-image [src]="product.imageUrl" [alt]="product.name">
      <mat-card-content>
        <div class="card-header">
            <span class="title">{{product.name}}</span>
            <span class="price">{{product.price | currency}}</span>
        </div>
        <p>{{product.description}}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="accent" (click)="add.emit(product)">Add to Cart</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .product-card { max-width: 300px; margin: 16px; transition: transform 0.2s; display: flex; flex-direction: column; }
    .product-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important; }
    .card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 8px; }
    mat-card-content { flex-grow: 1; }
    img { height: 200px; object-fit: cover; }
  `]
})
export class ProductCardComponent {
  @Input({required: true}) product!: Product;
  @Output() add = new EventEmitter<Product>();
}
