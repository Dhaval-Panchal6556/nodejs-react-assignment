import { HttpStatus } from "@nestjs/common";

export function successResponse(
  status: HttpStatus.OK,
  message: string,
  data: unknown
) {
  return { status, message, data };
}