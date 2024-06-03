import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const BaseTypeSchema = Joi.object().pattern(
  Joi.string().trim(),
  Joi.string().trim().valid("sub-admin", "user").default("user")
);

export const BlockAccountValidator = BaseValidator.keys({
  id: Joi.string().trim().required().uuid(),
  type: BaseTypeSchema,
});
