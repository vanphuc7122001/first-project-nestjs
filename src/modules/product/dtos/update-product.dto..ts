export class UpdateProductDto {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  categories?: CategoryType[];
}

export class CategoryType {
  id: string;
}
