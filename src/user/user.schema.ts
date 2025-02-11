import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    birthdate: Date;

    @Prop({ type: [String], default: [] })
    preferences: string[];

    @Prop({ default: false })
    discountGenerated: boolean;

    @Prop({ default: false })
    notificationSent: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
