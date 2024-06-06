import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const CreateProductValidator = BaseValidator.keys({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  image: Joi.string().trim().required(),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().min(0),
  categoryId: Joi.string().trim().required(),
});
