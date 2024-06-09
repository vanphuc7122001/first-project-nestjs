import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const CreateCategoryValidator = BaseValidator.keys({
  name: Joi.string().trim().required(),
  // level: Joi.number().required(),
  parentId: Joi.string().trim().allow(null),
});
