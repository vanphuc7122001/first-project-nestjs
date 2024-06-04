import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

const BaseTypeSchema = Joi.object().pattern(
  Joi.string().trim(),
  Joi.string().trim().valid("saler", "user").default("user")
);

export const UnBlockAccountValidator = BaseValidator.keys({
  id: Joi.string().trim().required().uuid(),
  type: BaseTypeSchema,
});
