import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Developers, DevelopersDocument } from "./schemas/developer.schema";
import mongoose, { Model } from "mongoose";
import {
  AuthExceptions,
  CustomError,
  TypeExceptions,
} from "src/common/helpers/exceptions";
import { CreateDeveloperDto } from "./dto/create-developer.dto";
import * as bcrypt from "bcrypt";
import {
  COMMON_MSG,
  DEVELOPER_MSG,
} from "src/common/constants/response.constant";
import { statusOk } from "src/common/constants/respones.status.constant";
import { successResponse } from "src/common/helpers/responses/success.helper";
import { AuthService } from "src/security/auth/auth.service";
import { LoginDto } from "src/common/dto/common.dto";
import { DeveloperListPaginationDto } from "./dto/list-developer.dto";
import { LoggerService } from "src/common/logger/logger.service";
import { Tasks, TasksDocument } from "src/task/schemas/task.schema";

@Injectable()
export class DeveloperService {
  constructor(
    @InjectModel(Developers.name)
    private readonly developerModel: Model<DevelopersDocument>,
    @InjectModel(Tasks.name)
    private readonly taskModel: Model<TasksDocument>,
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService
  ) {}

  async registerDeveloper(body: CreateDeveloperDto, res) {
    try {
      const findDeveloperEmail = await this.developerModel.findOne({
        email: body.email.toLowerCase(),
      });

      if (findDeveloperEmail) {
        throw TypeExceptions.AlreadyExistsCommonFunction(
          COMMON_MSG.EMAIL_ALREADY_EXISTS
        );
      }

      const findDeveloperPhoneNum = await this.developerModel.findOne({
        phoneNumber: body.phoneNumber,
      });

      if (findDeveloperPhoneNum) {
        throw TypeExceptions.AlreadyExistsCommonFunction(
          COMMON_MSG.PHONE_NUM_ALREADY_EXISTS
        );
      }

      const insertObj = {
        ...body,
        password: await bcrypt.hash(body.password, 10),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      const createDeveloper = await this.developerModel.create(insertObj);

      // Jwt payload create
      const payload = {
        _id: createDeveloper._id,
        email: createDeveloper.email,
        type: "developer",
      };

      // Generate JWT token for the admin
      const jwtToken = await this.authService.generateAuthToken(payload);
      return res.status(statusOk).json(
        successResponse(statusOk, DEVELOPER_MSG.DEVELOPER_REGISTER_SUCC, {
          authToken: jwtToken,
        })
      );
    } catch (error) {
      throw CustomError.UnknownError(error?.message, error?.status);
    }
  }

  async developerLogin(body: LoginDto, res) {
    try {
      const findDeveloper = await this.developerModel.findOne({
        email: body.email.toLowerCase(),
      });

      if (!findDeveloper) {
        throw TypeExceptions.AlreadyExistsCommonFunction(
          DEVELOPER_MSG.DEVELOPER_NOT_FOUND
        );
      }

      // Validate password
      if (!bcrypt.compareSync(body.password, findDeveloper.password)) {
        // Password mismatch, throw an invalid ID or password exception
        throw AuthExceptions.InvalidPassword();
      }

      // Jwt payload create
      const payload = {
        _id: findDeveloper._id,
        email: findDeveloper.email,
        type: "developer",
      };

      // Generate JWT token for the admin
      const jwtToken = await this.authService.generateAuthToken(payload);
      return res.status(statusOk).json(
        successResponse(statusOk, DEVELOPER_MSG.DEVELOPER_LOGIN_SUCC, {
          authToken: jwtToken,
          developerId: findDeveloper._id,
          name: findDeveloper.name,
        })
      );
    } catch (error) {
      throw CustomError.UnknownError(error?.message, error?.status);
    }
  }

  async developerList(body: DeveloperListPaginationDto, res, req) {
    try {
      const limit = body.limit ? Number(body.limit) : 10;
      const page = body.page ? Number(body.page) : 1;
      const skip = (page - 1) * limit;

      const aggregateQuery = [];

      aggregateQuery.push({
        $addFields: {
          isMatching: {
            $cond: [
              {
                $eq: ["$_id", new mongoose.Types.ObjectId(req.user._id)],
              },
              true,
              false,
            ],
          },
        },
      });

      aggregateQuery.push({
        $sort: { isMatching: -1 }, // Sorting to ensure the matched task is first
      });

      aggregateQuery.push({
        $project: {
          _id: 1,
          name: 1,
        },
      });

      aggregateQuery.push({
        $facet: {
          taskList: [{ $skip: skip }, { $limit: limit }],
          total_records: [{ $count: "count" }],
        },
      });

      const developerList = await this.developerModel.aggregate(aggregateQuery);

      if (developerList) {
        developerList[0].total_records =
          developerList[0].total_records.length > 0
            ? developerList[0].total_records[0].count
            : 0;
      }

      return res.status(statusOk).json(
        successResponse(statusOk, DEVELOPER_MSG.DEVELOPER_LIST_SUCC, {
          ...developerList[0],
        })
      );
    } catch (error) {
      throw CustomError.UnknownError(error?.message, error?.status);
    }
  }

  async createInitialDeveloper() {
    try {
      const findDeveloperEmail = await this.developerModel.find({
        $or: [{ email: "john@yopmail.com" }, { email: "michel@yopmail.com" }],
      });

      if (findDeveloperEmail?.length) {
        return false;
      }

      const insertObjs = [
        {
          name: "John Doe",
          email: "john@yopmail.com",
          phoneNumber: "8956237412",
          countryCode: "+91",
          password: await bcrypt.hash("John@123", 10),
        },
        {
          name: "Michel Jackson",
          email: "michel@yopmail.com",
          phoneNumber: "7894561237",
          countryCode: "+91",
          password: await bcrypt.hash("Michel@123", 10),
        },
        {
          name: "UnAssign",
          email: "unassign@yopmail.com",
          phoneNumber: "4561237895",
          countryCode: "+91",
          password: await bcrypt.hash("Unassign@123", 10),
        },
      ];

      await this.developerModel.insertMany(insertObjs);

      this.loggerService.log("Initial user loaded successfully.");
    } catch (error) {
      throw CustomError.UnknownError(error?.message, error?.status);
    }
  }

  async developerCountWiseList(body: DeveloperListPaginationDto, res) {
    try {
      const limit = body.limit ? Number(body.limit) : 10;
      const page = body.page ? Number(body.page) : 1;
      const skip = (page - 1) * limit;

      const aggregateQuery = [];

      aggregateQuery.push({
        $match: {
          status: {
            $in: ["todo", "inProgress"],
          },
        },
      });

      aggregateQuery.push({
        $addFields: {
          consideredDeveloper: {
            $cond: {
              if: {
                $eq: ["$developerId", "$assignedTo"],
              },
              then: "$developerId",
              else: "$assignedTo",
            },
          },
        },
      });

      aggregateQuery.push({
        $lookup: {
          from: "table_developer",
          localField: "consideredDeveloper",
          foreignField: "_id",
          as: "developer",
        },
      });

      aggregateQuery.push({
        $unwind: {
          path: "$developer",
          preserveNullAndEmptyArrays: true,
        },
      });

      aggregateQuery.push({
        $group: {
          _id: "$developer.name",
          todoCount: {
            $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] },
          },
          inProgressCount: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
        },
      });

      aggregateQuery.push({
        $project: {
          _id: 0,
          developerName: "$_id",
          todoCount: 1,
          inProgressCount: 1,
        },
      });

      aggregateQuery.push({
        $sort: {
          developerName: 1,
        },
      });

      aggregateQuery.push({
        $facet: {
          developerCountRes: [{ $skip: skip }, { $limit: limit }],
          total_records: [{ $count: "count" }],
        },
      });
      const developerCountList = await this.taskModel.aggregate(aggregateQuery);

      if (developerCountList) {
        developerCountList[0].total_records =
          developerCountList[0].total_records.length > 0
            ? developerCountList[0].total_records[0].count
            : 0;
      }

      return res.status(statusOk).json(
        successResponse(statusOk, DEVELOPER_MSG.DEVELOPER_COUNT_LIST_SUCC, {
          ...developerCountList[0],
        })
      );
    } catch (error) {
      throw CustomError.UnknownError(error?.message, error?.status);
    }
  }
}
