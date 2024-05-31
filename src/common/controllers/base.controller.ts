import { HttpErrorResponse, HttpSuccessResponse } from '@common/responses';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiOkResponse({ type: HttpSuccessResponse })
@ApiBadRequestResponse({ type: HttpErrorResponse })
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: HttpErrorResponse,
})
export class BaseController {}
