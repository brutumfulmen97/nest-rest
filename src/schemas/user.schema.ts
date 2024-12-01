import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsEmail, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop({
    required: true,
    enum: ['ADMIN', 'USER'],
  })
  @IsEnum(['ADMIN', 'USER'], {
    message: 'Role must be either ADMIN or USER',
  })
  @IsNotEmpty()
  role: 'ADMIN' | 'USER';
}

export const UserSchema = SchemaFactory.createForClass(User);
