import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DeveloperListPaginationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  limit: number;
}
