import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product';

export interface CartItem extends Product {
    quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  totalCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  
  addToCart(product: Product) {
    this.cartItems.update(items => {
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            return items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...items, { ...product, quantity: 1 }];
    });
  }
}
