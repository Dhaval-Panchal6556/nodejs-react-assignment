import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { AuthExceptions } from "src/common/helpers/exceptions";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import {
  Developers,
  DevelopersDocument,
} from "src/developer/schemas/developer.schema";

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Developers.name)
    private readonly developerModel: Model<DevelopersDocument>
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      const secretKey = process.env.JWT_SECRET;
      const accessToken = req.headers.authorization.split(" ")[1];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const letData: any = verify(accessToken, secretKey);

        const loginUserId = new mongoose.Types.ObjectId(letData._id);

        const findUser = await this.findUserByType(1, loginUserId);

        if (findUser == null) {
          throw AuthExceptions.InvalidToken();
        }

        if (letData._id == undefined) {
          letData._id = letData.id;
        }

        req["user"] = letData;
        next();
      } catch (error) {
        if (error?.name === "TokenExpiredError") {
          throw AuthExceptions.TokenExpired();
        }
        if (error?.name === "JsonWebTokenError") {
          throw AuthExceptions.InvalidToken();
        }
        if (error) {
          AuthExceptions.ForbiddenException();
        }
        throw new InternalServerErrorException("Internal Server error");
      }
    } else {
      next();
    }
  }

  async findUserByType(type: number, loginUserId) {
    const typeModelMap = {
      1: this.developerModel,
    };
    const modelName = typeModelMap[type];
    if (modelName) {
      return await modelName.findOne({
        _id: new mongoose.Types.ObjectId(loginUserId),
      });
    } else {
      return null;
    }
  }
}
