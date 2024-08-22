import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { TABLE_NAMES } from "../../common/constants/table-name.constant";

export type DevelopersDocument = Developers & Document;

@Schema({ collection: TABLE_NAMES.DEVELOPER })
export class Developers {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  createdDate: Date;

  @Prop()
  updatedDate: Date;
}

export const DevelopersSchema = SchemaFactory.createForClass(Developers);
