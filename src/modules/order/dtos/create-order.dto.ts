import { OrderStatus } from "../enums";

class OrderDetailType {
  productId: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
}

export class CreateOrderDto {
  paymentMethod: string;
  shippingAddress: string;
  shippingMethod: string;
  phone: string;
  status: OrderStatus;
  totalAfter: number;
  note?: string;
  orderDetails: OrderDetailType[];
}
