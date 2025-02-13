import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';
import { Request, Response } from 'express';
import { SystemResponse } from 'src/libs/response-handler';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductDto } from './dto/product.dto';

@ApiTags('Products')

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }


    @Post('load')
    @ApiBody({
        description: 'Create Products',
        type: ProductDto,
        examples: {
            'application/json': {
                value:
                    [
                        {
                            "name": "string",
                            "category": "Grains & Pasta",
                            "rating": 4.8
                        }
                    ]

            },
        },
    })
    @ApiOperation({ summary: 'Creates multiple products' })
    @ApiResponse({ status: 200, description: 'Products loaded successfully' })
    @ApiResponse({ status: 404, description: 'Not found' })

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
