import * as Joi from "joi";

import { BaseValidator } from "@common/validators";
import { OrderStatus } from "../enums";

export const UpdateStatusValidator = BaseValidator.keys({
  status: Joi.string()
    .trim()
    .valid(...Object.values(OrderStatus)),
});
