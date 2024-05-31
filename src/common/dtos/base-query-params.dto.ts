import { ApiPropertyOptional } from '@nestjs/swagger';

export class BaseQueryParams {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;

  @ApiPropertyOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: ['asc', 'desc', 'ascending', 'descending', 1, -1],
  })
  sort?: {
    [key: string]: 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1;
  };
}
