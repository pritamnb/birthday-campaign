import { Controller, Get, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { Request, Response } from 'express';
import { StatusCodes, SystemResponse } from 'src/libs/response-handler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Discounts')

@Controller('discount')
export class DiscountController {
    constructor(private readonly discountService: DiscountService) { }


    @Post('redeem')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Redeem the code' })
    @ApiResponse({ status: 200, description: 'Discount successfully redeemed!' })
    @ApiResponse({ status: 400, description: 'Invalid or already used discount code!' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async redeemDiscount(
        @Req() req: Request | any,
        @Res() res: Response,
        @Body('code') code: string
    ) {
        try {
            const { logger } = res.locals;
            const userId = req?.user?._id; // userid from token

            const isValid = await this.discountService.validateDiscountCode(userId, code);

            if (!isValid) return res.status(StatusCodes.BAD_REQUEST).send(SystemResponse.badRequestError('Invalid or already used discount code!', isValid))

            logger.info({
                message: 'Discount successfully redeemed!',
                data: [],
                option: [],
            });
            return res.status(StatusCodes.SUCCESS).send(
                SystemResponse.success('Discount successfully redeemed!', isValid),
            );
        } catch (err) {
            return res.status(StatusCodes.NOT_FOUND).send(SystemResponse.internalServerError('Error', err.message));
        }
    }

    @Get('available')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get available codes' })
    @ApiResponse({ status: 200, description: 'Discount code successfully redeemed!' })
    @ApiResponse({ status: 404, description: 'Not found' })

    async getAvailableDiscounts(
        @Req() req: Request | any,
        @Res() res: Response
    ) {
        try {
            const { logger } = res.locals;
            const userId = req?.user?._id;
            const availableDiscounts = await this.discountService.getAvailableDiscounts(userId);
            if (!availableDiscounts) return res.status(StatusCodes.NOT_FOUND).send(SystemResponse.notFoundError('User discounts not found!', availableDiscounts))

            logger.info({
                message: 'Discounts code fetched successfully!',
                data: [],
                option: [],
            });
            return res.status(StatusCodes.SUCCESS).send(SystemResponse.success('Discounts code fetched successfully', availableDiscounts));
        } catch (err) {
            return res.status(StatusCodes.NOT_FOUND).send(SystemResponse.internalServerError('Error', err.message));
        }
    }
}
