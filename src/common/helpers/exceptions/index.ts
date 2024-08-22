import { HttpException, HttpStatus } from "@nestjs/common";

export * from "./auth.exception";
export * from "./type.exception";
export * from "./connection.exception";

export const CustomError = {
  UnknownError(message, statusCode?): unknown {
    return new HttpException(
      {
        message: message || 'Something went wrong, please try again later!',
        error: 'UnknownError',
        statusCode: statusCode || HttpStatus.BAD_REQUEST,
      },
      statusCode || HttpStatus.BAD_REQUEST,
    );
  },
};
