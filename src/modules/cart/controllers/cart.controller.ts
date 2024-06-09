import { Controller, Post } from "@nestjs/common";

import { CartService } from "../services";

/**
 * Key features
 * 1. Add to cart
 * 2. Remove a product or many product in cart
 * 3. Remove all cart
 * 4. List cart
 * 5. List cart for user_id
 */

@Controller("carts")
export class CartController {
  constructor(private readonly _cartService: CartService) {}

  @Post()
  addCart() {
    return "add to cart";
  }
}
