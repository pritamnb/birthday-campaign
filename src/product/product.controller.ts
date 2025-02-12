import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';
import { Request, Response } from 'express';
import { SystemResponse } from 'src/libs/response-handler';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get('/suggestions/:userId')
    async getUserSuggestions(
        @Req() req: Request,
        @Res() res: Response,
        @Param('userId') userId: string
    ) {
        try {
            const { logger } = res.locals;

            const products = await this.productService.getTopRatedProductByCategory(userId);
            if (!products) return res.send(SystemResponse.notFoundError('Products not found!', products))

            logger.info({
                message: 'Products fetched successfully',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('Products fetched successfully', products),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }

    @Post('/load')
    async loadProductData(
        @Res() res: Response,
        @Body() products: Product[]
    ) {
        try {
            const { logger } = res.locals;

            const result = await this.productService.loadProducts(products);
            if (!result) return res.send(SystemResponse.notFoundError('Loading products failed!!', result))

            logger.info({
                message: 'Products loaded successfully!',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('Products loaded successfully!', { count: result.length }),
            )
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }
}
