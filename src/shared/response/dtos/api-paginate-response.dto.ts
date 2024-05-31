import { Request } from 'express';
import { BaseQueryParams } from '@common/dtos';

export class ApiPaginateResponseInput<T> {
  count: number;
  data: T[];
  query?: BaseQueryParams;
  req?: Request;
}

export class ApiPaginateResponse<T> {
  next?: string;
  previous?: string;
  count: number;
  results: T[];
}
