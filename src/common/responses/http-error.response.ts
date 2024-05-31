import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpErrorResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  messageCode: string;

  @ApiProperty()
  error: string;

  @ApiPropertyOptional()
  errors?: Record<string, unknown>;

  @ApiPropertyOptional()
  path?: string;
}
