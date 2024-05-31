import * as Joi from 'joi';
import { BaseValidator } from '@common/validators';

export const LoginValidator = BaseValidator.keys({
  id: Joi.string().trim().uuid().required(),
  password: Joi.string().trim().required(),
});
