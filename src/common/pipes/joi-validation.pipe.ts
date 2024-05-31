import { ObjectSchema } from 'joi';
import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly _schema: ObjectSchema) {}

  transform(value: any) {
    const result = this._schema.validate(value);

    if (result.error) {
      throw new HttpException(
        {
          errors: result.error.details.map((detail) => ({
            message: detail.message,
            ...detail.context,
          })),
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return result.value;
  }
}
