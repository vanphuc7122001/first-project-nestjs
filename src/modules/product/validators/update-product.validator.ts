import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const UpdateProductValidator = BaseValidator.keys({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  image: Joi.string().trim().optional(),
  price: Joi.number().optional().min(0),
});
