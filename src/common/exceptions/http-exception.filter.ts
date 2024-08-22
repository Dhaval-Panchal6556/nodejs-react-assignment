import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { isArray } from "class-validator";
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string = exception
      ? exception.message
      : "Internal server error";

    if (exception?.response?.message && isArray(exception.response.message)) {
      message = exception.response.message[0];
    } else if (exception?.response?.message) {
      message = exception.response.message;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      data: {},
    });
  }
}
