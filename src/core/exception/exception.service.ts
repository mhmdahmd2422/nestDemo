import { HttpStatus, Injectable } from '@nestjs/common';
import { Exception } from './exception';

export interface IException {
  status: HttpStatus
  /**
   * Unique code per controller the client can rely on.
   */
  code: number
  /**
   * This log is visible by the client.
   */
  publicMessage: string
  /**
   * This log is printed by the API and not visible by the client.
   */
  privateMessage?: string
  /**
   * Error or payload which causes the exception
   */
  cause?: any
}

@Injectable()
export class ExceptionService {
  throw(payload: IException): never {
    throw new Exception({
      code: payload.code,
      message: payload.publicMessage,
      status: payload.status,
    })
  }

  isCustom(exception: Exception): boolean {
    try {
      const payload = exception.getResponse() as any

      return payload?.type === 'CORE_EXCEPTION'
    } catch (error) {
      return false
    }
  }

  getPayload(exception: Exception): { code: number; message: string } {
    return exception.getResponse() as any
  }
}
