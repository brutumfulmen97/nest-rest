import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  @IsUrl()
  @IsNotEmpty()
  avatarUrl: string;

  @Prop({ required: true })
  @IsUrl()
  @IsNotEmpty()
  webUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
