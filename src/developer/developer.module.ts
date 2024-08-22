import { Module, OnModuleInit } from "@nestjs/common";
import { DeveloperService } from "./developer.service";
import { DeveloperController } from "./developer.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Developers, DevelopersSchema } from "./schemas/developer.schema";
import { AuthService } from "src/security/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { LoggerService } from "src/common/logger/logger.service";
import { Tasks, TasksSchema } from "src/task/schemas/task.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Developers.name, schema: DevelopersSchema },
      { name: Tasks.name, schema: TasksSchema },
    ]),
  ],
  controllers: [DeveloperController],
  providers: [DeveloperService, AuthService, JwtService, LoggerService],
})
export class DeveloperModule implements OnModuleInit {
  constructor(private readonly developerService: DeveloperService) {}

  async onModuleInit(): Promise<void> {
    await this.developerService.createInitialDeveloper();
  }
}

