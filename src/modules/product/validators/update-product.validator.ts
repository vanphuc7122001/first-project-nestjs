import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

const BaseCategoriesSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().trim().required(),
    })
  )
  .optional();

export const UpdateProductValidator = BaseValidator.keys({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  image: Joi.string().trim().optional(),
  price: Joi.number().optional().min(0),
  quantity: Joi.number().optional().min(0),
  categories: BaseCategoriesSchema,
});
