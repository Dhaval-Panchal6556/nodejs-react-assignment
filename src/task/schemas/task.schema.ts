import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { TABLE_NAMES } from "../../common/constants/table-name.constant";
import { Developers } from "src/developer/schemas/developer.schema";

export type TasksDocument = Tasks & Document;

@Schema({ collection: TABLE_NAMES.TASK })
export class Tasks {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: "todo" })
  status: string;

  @Prop({ type: Types.ObjectId, ref: Developers.name })
  assignedTo: Developers;

  @Prop({ type: Types.ObjectId, ref: Developers.name })
  developerId: Developers;

  @Prop()
  createdDate: Date;

  @Prop()
  updatedDate: Date;

  @Prop()
  inProgressDate: Date;
}

export const TasksSchema = SchemaFactory.createForClass(Tasks);
