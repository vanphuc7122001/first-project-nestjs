import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

// const subCategorySchema = Joi.object({
//   name: Joi.string().trim().required(),
// }).options({
//   stripUnknown: true,
// });

export const CreateCategoryValidator = BaseValidator.keys({
  name: Joi.string().trim().required(),
  // level: Joi.number().required(),
  parentId: Joi.string().trim().allow(null),
});
