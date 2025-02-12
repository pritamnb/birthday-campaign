import { Controller, Get, Post, Param } from '@nestjs/common';
import { DiscountService } from './discount.service';

@Controller('discount')
export class DiscountController {
    constructor(private readonly discountService: DiscountService) { }



    @Get('/redeem/:userId/:code')
    async redeemDiscount(@Param('userId') userId: string, @Param('code') code: string) {
        const isValid = await this.discountService.validateDiscountCode(userId, code);
        if (isValid) {
            return { message: 'Discount successfully redeemed!' };
        } else {
            return { message: 'Invalid or already used discount code!' };
        }
    }

    @Get('/available/:userId')
    async getAvailableDiscounts(@Param('userId') userId: string) {
        const availableDiscounts = await this.discountService.getAvailableDiscounts(userId);
        return { availableDiscounts };
    }
}
