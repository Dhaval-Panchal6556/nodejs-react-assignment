import { Module } from "@nestjs/common";
import { DeveloperService } from "./developer.service";
import { DeveloperController } from "./developer.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Developers, DevelopersSchema } from "./schemas/developer.schema";
import { AuthService } from "src/security/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { LoggerService } from "src/common/logger/logger.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Developers.name, schema: DevelopersSchema },
    ]),
  ],
  controllers: [DeveloperController],
  providers: [DeveloperService, AuthService, JwtService, LoggerService],
})
export class DeveloperModule {}
