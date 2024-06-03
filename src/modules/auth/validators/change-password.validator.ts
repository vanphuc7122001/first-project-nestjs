import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const ChangePasswordValidator = BaseValidator.keys({
  oldPassword: [Joi.string().trim(), Joi.any().strip()],
  newPassword: Joi.string().trim().required(),
});
