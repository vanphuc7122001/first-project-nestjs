import { ApiProperty } from '@nestjs/swagger';

export class HttpSuccessResponse<T> {
  @ApiProperty()
  message: string;

  @ApiProperty()
  messageCode: string;

  @ApiProperty()
  data: T;

  constructor(data: T) {
    this.message = 'SUCCESS';
    this.messageCode = 'SUCCESS';
    this.data = data;
  }
}
