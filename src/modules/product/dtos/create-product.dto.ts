export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  categories: CategoryType[];
}

export class CategoryType {
  id: string;
}
