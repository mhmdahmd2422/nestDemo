import { HttpStatus, Injectable } from '@nestjs/common'
import { ExceptionService } from '../core/exception';

@Injectable()
export class UserException {
  constructor(private service: ExceptionService) { }

  notFoundById() {
    return this.service.throw({
      status: HttpStatus.NOT_FOUND,
      code: 1,
      publicMessage: 'User was not found',
    })
  }

  notFoundByEmail() {
    return this.service.throw({
      status: HttpStatus.NOT_FOUND,
      code: 2,
      publicMessage: 'User was not found',
    })
  }

  usedEmail() {
    return this.service.throw({
      status: HttpStatus.BAD_REQUEST,
      code: 2,
      publicMessage: 'User Email already exists',
    })
  }
}
