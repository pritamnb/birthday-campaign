import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class ProductDto {//(Data Transfer Object)
    @ApiProperty({
        description: 'The unique identifier of the discount',
    })
    _id: string;
    @ApiProperty({
        description: 'The name of the product',
        example: 'Sample Product',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The category of the product',
        example: 'Electronics',
    })
    @IsString()
    category: string;

    @ApiProperty({
        description: 'The rating of the product, from 0 to 5',
        example: 4,
    })
    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;
}
