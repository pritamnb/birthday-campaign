import { Controller, Get, Post, Param, Req, Res } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { Request, Response } from 'express';
import { SystemResponse } from 'src/libs/response-handler';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Discounts')

@Controller('discount')
export class DiscountController {
    constructor(private readonly discountService: DiscountService) { }


    @Get('/redeem/:userId/:code')
    async redeemDiscount(
        @Req() req: Request,
        @Res() res: Response,
        @Param('userId') userId: string, @Param('code') code: string
    ) {
        try {
            const { logger } = res.locals;

            const isValid = await this.discountService.validateDiscountCode(userId, code);

            if (!isValid) return res.send(SystemResponse.notFoundError('Invalid or already used discount code!', isValid))

            logger.info({
                message: 'Discount successfully redeemed!',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('Discount successfully redeemed!', isValid),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }

    @Get('/available/:userId')
    async getAvailableDiscounts(
        @Req() req: Request,
        @Res() res: Response,
        @Param('userId') userId: string
    ) {

        try {
            const { logger } = res.locals;

            const availableDiscounts = await this.discountService.getAvailableDiscounts(userId);
            if (!availableDiscounts) return res.send(SystemResponse.notFoundError('User discounts not found!', availableDiscounts))

            logger.info({
                message: 'Discounts fetched successfully!',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('Discounts fetched successfully', availableDiscounts),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }
}
