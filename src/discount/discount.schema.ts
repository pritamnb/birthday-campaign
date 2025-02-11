import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiscountDocument = Discount & Document;

@Schema()
export class Discount {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ default: false })
    used: boolean;

    @Prop({ default: new Date() })
    issuedAt: Date;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
