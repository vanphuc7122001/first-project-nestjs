class subCategories {
  name: string;
}

export class CreateCategoryDto {
  name: string;
  subCategories?: subCategories[];
}
