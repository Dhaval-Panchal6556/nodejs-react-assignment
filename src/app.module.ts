import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "./common/logger/logger.module";
import { AuthModule } from "./security/auth/auth.module";
import { JwtAuthGuard } from "./security/auth/guards/jwt-auth.guard";
import { DatabaseModule } from "./providers/database/mongo/database.module";
import { ThrottleModule } from "./security/throttle/throttle.module";
import { DeveloperModule } from "./developer/developer.module";
import { TaskModule } from "./task/task.module";
import AppConfiguration from "./config/app.config";
import DatabaseConfiguration from "./config/database.config";
import AuthConfiguration from "./config/auth.config";
import { CustomExceptionFilter } from "./common/exceptions/http-exception.filter";
import { UserAuthMiddleware } from "./common/middleware/userAuth.middleware";
import { MongooseModule } from "@nestjs/mongoose";
import { Developers, DevelopersSchema } from "./developer/schemas/developer.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfiguration, DatabaseConfiguration, AuthConfiguration],
      ignoreEnvFile: false,
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: Developers.name, schema: DevelopersSchema }]),
    DatabaseModule,
    LoggerModule,
    AuthModule,
    ThrottleModule,
    DeveloperModule,
    TaskModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).forRoutes("/task/*");
    consumer.apply(UserAuthMiddleware).forRoutes("/developer/*");
  }
}
