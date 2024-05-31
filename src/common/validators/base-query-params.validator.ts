import * as Joi from 'joi';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@common/constants';

export const BaseQuerySortSchema = Joi.object().pattern(
  Joi.string().trim(),
  Joi.string()
    .trim()
    .valid('asc', 'desc', 'ascending', 'descending', 1, -1)
    .default('asc')
);

export const BaseQueryParamsValidator = Joi.object({
  noPagination: Joi.boolean().default(false),
  page: Joi.when('noPagination', {
    is: true,
    then: Joi.any().strip(),
    otherwise: Joi.number().integer().min(1).default(DEFAULT_PAGE),
  }),
  limit: Joi.when('noPagination', {
    is: true,
    then: Joi.any().strip(),
    otherwise: Joi.number().integer().min(1).max(50).default(DEFAULT_PAGE_SIZE),
  }),
  search: [Joi.string().trim(), Joi.any().strip()],
  sort: BaseQuerySortSchema,
}).options({ stripUnknown: true });
