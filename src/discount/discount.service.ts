import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discount, DiscountDocument } from './discount.schema';

@Injectable()
export class DiscountService {
    constructor(
        @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>
    ) { }

    /**
     * To generate a discount code
     * @param userId 
     * @returns new code or old unused code
     */
    async generateDiscountCode(userId: string): Promise<string> {
        const existingDiscount = await this.discountModel.findOne({ userId, used: false });

        if (existingDiscount) {
            return existingDiscount.code;
        }

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
        return this.discountModel.find({ userId, used: false, isExpired: false }).exec();
    }


    /**
    * 
    * @param userId 
    * expires codes if birthdate is passed 
    */
    async expireCode(userId: string | unknown) {
        const discount = await this.discountModel.findOne({ userId });

        if (!discount) {
            throw new Error(`No discount found for user with ID ${userId}`);
        }
        discount.isExpired = true;
        await discount.save()
        console.info(`Discount for user ${userId} has been expired.`);
    }
}
