import { Controller, Post, Body, Res, Req } from "@nestjs/common";
import { DeveloperService } from "./developer.service";
import { CreateDeveloperDto } from "./dto/create-developer.dto";
import { Response } from "express";
import { Public } from "src/security/auth/auth.decorator";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { LoginDeveloperDto } from "./dto/login-developer.dto";
import { DeveloperListPaginationDto } from "./dto/list-developer.dto";

@ApiTags("Developer")
@Controller("developer")
@ApiBearerAuth()
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}

  @Public()
  @Post("register")
  registerDeveloper(@Body() body: CreateDeveloperDto, @Res() res: Response) {
    return this.developerService.registerDeveloper(body, res);
  }

  @Public()
  @Post("login")
  developerLogin(@Body() body: LoginDeveloperDto, @Res() res: Response) {
    return this.developerService.developerLogin(body, res);
  }

  @Post("list")
  developerList(
    @Body() body: DeveloperListPaginationDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    return this.developerService.developerList(body, res, req);
  }
}
