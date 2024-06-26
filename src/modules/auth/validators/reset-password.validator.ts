import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const ResetPasswordValidator = BaseValidator.keys({
  forgot_password_token: Joi.string().trim().required(),
  new_password: Joi.string().trim().required(),
});
