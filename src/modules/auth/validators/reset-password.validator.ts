import * as Joi from 'joi';
import { BaseValidator } from '@common/validators';

export const ResetPasswordValidator = BaseValidator.keys({
  id: Joi.string().trim().required(),
  code: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
});
