import { HttpPaginateSuccessResponse } from '@common/responses';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginateSuccessResponse<T extends Type<unknown>>(data: T) {
  return applyDecorators(
    ApiExtraModels(HttpPaginateSuccessResponse, data),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(HttpPaginateSuccessResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(data) },
              },
            },
          },
        ],
      },
    }),
  );
}
