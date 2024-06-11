import * as Joi from "joi";

import { PaymentMethod, ShippingMethod } from "../enums";

import { BaseValidator } from "@common/validators";

const BaseOrderDetailSchema = Joi.array()
  .items(
    Joi.object({
      productId: Joi.string().trim().required(),
      productName: Joi.string().trim().required(),
      productPrice: Joi.number().required(),
      productQuantity: Joi.number().required(),
    })
  )
  .required()
  .min(1);

export const CreateOrderValidator = BaseValidator.keys({
  paymentMethod: Joi.string()
    .trim()
    .valid(...Object.values(PaymentMethod))
    .required(),
  shippingAddress: Joi.string().trim().required(),
  shippingMethod: Joi.string()
    .trim()
    .valid(...Object.values(ShippingMethod))
    .required(),
  phone: Joi.string().trim().required(),
  note: Joi.string().trim().optional(),
  totalAfter: Joi.number().required(),
  orderDetails: BaseOrderDetailSchema,
});
