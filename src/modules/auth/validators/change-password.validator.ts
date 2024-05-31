import * as Joi from 'joi';
import { BaseValidator } from '@common/validators';

export const ChangePasswordValidator = BaseValidator.keys({
  currentPassword: [Joi.string().trim(), Joi.any().strip()],
  password: Joi.string().trim().required(),
});
