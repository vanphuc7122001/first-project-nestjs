import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseQueryParams } from "@common/dtos";

export class OrderQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({})
  where?: {
    [key: string]: string;
  };
}
