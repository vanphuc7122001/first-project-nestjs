import * as Joi from 'joi';
import { BaseValidator } from '@common/validators';

export const ForgotPasswordValidator = BaseValidator.keys({
  id: Joi.string().trim().required(),
});
