import { stringify } from 'qs';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@common/constants';
import { Injectable } from '@nestjs/common';
import {
  ApiErrorResponse,
  ApiPaginateResponse,
  ApiPaginateResponseInput,
} from './dtos';
import { ResponseMessageCode } from './enums';

@Injectable()
export class ResponseService {
  public static paginateResponse<T>(
    input: ApiPaginateResponseInput<T>
  ): ApiPaginateResponse<T> {
    const { count, data, query = {}, req } = input;
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_PAGE_SIZE,
      ...restQueryParams
    } = query;

    const url = req?.path ?? '';
    const nextPage = page * limit < count ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    const next = nextPage
      ? `${url}?${stringify({ ...restQueryParams, page: nextPage, limit })}`
      : null;
    const previous = previousPage
      ? `${url}?${stringify({
          ...restQueryParams,
          page: previousPage,
          limit,
        })}`
      : null;

    return {
      next,
      previous,
      count,
      results: data,
    };
  }

  public static errorResponse(exception: any): ApiErrorResponse {
    return {
      message: exception?.response?.message ?? exception?.message,
      messageCode: exception?.response?.code ?? ResponseMessageCode.FAILED,
      error: exception?.response?.error ?? exception?.name,
      errors: exception?.response?.errors ?? null,
    };
  }
}
