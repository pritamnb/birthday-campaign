
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    category: string;

    @Prop({ required: true, min: 0, max: 5 })
    rating: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ category: 1 }, { collation: { locale: 'en', strength: 2 } });
