import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { COMMON_MSG } from "src/common/constants/response.constant";
import { EmailRegex, PasswordRegex } from "src/common/regex/common-regex";

export class CreateDeveloperDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsString()
  @Matches(EmailRegex, {
    message: COMMON_MSG.INVALID_EMAIL_FORMAT,
  })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @ApiProperty()
  @IsString()
  @Matches(PasswordRegex, {
    message: COMMON_MSG.INVALID_PASSWORD_FORMAT,
  })
  password: string;
}
