import * as Joi from 'joi';
import { Environment } from '@common/enums';
import { CONFIG_VAR, DEFAULT_PORT } from '@config/index';

export const ConfigSchema = Joi.object()
  .keys({
    [CONFIG_VAR.NODE_ENV]: Joi.string().trim().default(Environment.DEVELOPMENT),
    [CONFIG_VAR.PORT]: Joi.number().default(DEFAULT_PORT),

    // DATABASE
    [CONFIG_VAR.DATABASE_URL]: Joi.string().trim().required(),

    // JWT
    [CONFIG_VAR.JWT_SECRET]: Joi.string().trim().required(),
    [CONFIG_VAR.JWT_REFRESH_SECRET]: Joi.string().trim().required(),
    [CONFIG_VAR.ADMIN_JWT_SECRET]: Joi.string().trim().required(),
    [CONFIG_VAR.ADMIN_JWT_REFRESH_SECRET]: Joi.string().trim().required(),
    [CONFIG_VAR.JWT_EXPIRES_IN]: Joi.string().trim().required(),
    [CONFIG_VAR.JWT_REFRESH_EXPIRES_IN]: Joi.string().trim().required(),
  })
  .options({ stripUnknown: true });
