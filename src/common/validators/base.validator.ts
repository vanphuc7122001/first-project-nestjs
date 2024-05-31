import * as Joi from 'joi';

export const BaseValidator = Joi.object().options({ stripUnknown: true });
