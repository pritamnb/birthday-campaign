import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get('/suggestions/:userId')
    async getUserSuggestions(@Param('userId') userId: string) {
        const products = await this.productService.getTopRatedProductByCategory(userId);
        return { suggestedProducts: products };
    }

    @Post('/load')
    async loadProductData(@Body() products: Product[]) {
        const result = await this.productService.loadProducts(products);
        return { message: 'Products loaded successfully', count: result.length };
    }
}
