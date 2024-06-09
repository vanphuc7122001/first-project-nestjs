export class categoryIds {
  id: string;
}

export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  categories: categoryIds[];
}
