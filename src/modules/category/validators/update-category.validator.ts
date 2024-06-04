import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const UpdateCategoryValidator = BaseValidator.keys({
  name: Joi.string().trim().required(),
});
