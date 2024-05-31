import * as Joi from 'joi';
import { BaseValidator } from '@common/validators';

export const RegisterValidator = BaseValidator.keys({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().required(),
  firstName: [Joi.string().trim(), Joi.any().strip()],
  lastName: [Joi.string().trim(), Joi.any().strip()],
});
