export class subCategories {
  name: string;
}

// export class CreateCategoryDto {
//   name: string;
//   subCategories?: subCategories[];
// }

export class CreateCategoryDto {
  name: string;
  //
  parentId?: string;
}
