import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discount, DiscountDocument } from './discount.schema';

@Injectable()
export class DiscountService {
    constructor(@InjectModel(Discount.name) private discountModel: Model<DiscountDocument>) { }

    async generateDiscountCode(userId: string): Promise<string> {
        const discountCode = `BDAY-${Math.random().toString(36).substring(7).toUpperCase()}`;

        await this.discountModel.create({ userId, code: discountCode, used: false });

        return discountCode;
    }

    async validateDiscountCode(userId: string, discountCode: string): Promise<boolean> {
        const discount = await this.discountModel.findOne({ userId, code: discountCode, used: false });

        if (discount) {
            discount.used = true;
            await discount.save();
            return true;
        }

        return false;
    }

    async getAvailableDiscounts(userId: string): Promise<Discount[]> {
        return this.discountModel.find({ userId, used: false }).exec();
    }
}
