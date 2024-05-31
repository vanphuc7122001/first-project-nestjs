import { ApiProperty } from '@nestjs/swagger';

export class PaginateMetadataResponse {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalRow: number;

  @ApiProperty()
  totalPage: number;
}

export class HttpPaginateSuccessResponse<T> {
  @ApiProperty()
  metadata: PaginateMetadataResponse;

  @ApiProperty()
  data: T[];

  constructor(metadata: PaginateMetadataResponse, data: T[]) {
    this.metadata = metadata;
    this.data = data;
  }
}
