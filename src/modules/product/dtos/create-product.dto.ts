export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

// name        String            @db.VarChar(255)
//   description String?           @db.VarChar(255)
//   price       Float
//   image       String            @db.VarChar(255)
//   categories  ProductCategory[]
//   quantity    Int
