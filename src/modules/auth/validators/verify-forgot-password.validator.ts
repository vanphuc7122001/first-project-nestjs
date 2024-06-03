import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const VerifyForgotPasswordValidator = BaseValidator.keys({
  forgot_password_token: Joi.string().trim().required(),
});
