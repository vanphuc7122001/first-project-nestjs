import * as Joi from "joi";

import { BaseQueryParamsValidator } from "@common/validators";

const OrderQueryWhereParams = {
  status: Joi.array().items(Joi.string()),
};

export const OrderQueryParamsValidator = BaseQueryParamsValidator.keys({
  where: Joi.object(OrderQueryWhereParams),
});
