import * as Joi from 'joi';
import { BaseValidator } from '@common/validators';

export const RefreshTokenValidator = BaseValidator.keys({
  refresh: Joi.string().trim().required(),
});
