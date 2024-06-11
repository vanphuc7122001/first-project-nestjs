export class categoryIds {
  id: string;
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  quantity?: number;
  categories?: categoryIds[];
}
