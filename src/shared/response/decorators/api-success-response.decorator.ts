import { HttpSuccessResponse } from '@common/responses';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiSuccessResponse<T extends Type<unknown>>(
  data: T,
  isArray = false,
) {
  return applyDecorators(
    ApiExtraModels(HttpSuccessResponse, data),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(HttpSuccessResponse) },
          {
            type: 'object',
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(data) } }
                : { $ref: getSchemaPath(data) },
            },
          },
        ],
      },
    }),
  );
}
