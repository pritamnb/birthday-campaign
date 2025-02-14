import { ApiProperty } from '@nestjs/swagger';
//(Data Transfer Object)
export class DiscountResponseDto {
    @ApiProperty({
        description: 'The unique identifier of the discount',
    })
    _id: string;

    @ApiProperty({
        description: 'The user ID associated with the discount',
    })
    userId: string;

    @ApiProperty({
        description: 'The unique discount code',
    })
    code: string;

    @ApiProperty({
        description: 'Flag indicating if the discount has been used',
    })
    used: boolean;

    @ApiProperty({
        description: 'The date when the discount was issued',
        example: '2025-02-12T00:00:00.000Z',
    })
    issuedAt: Date;

    @ApiProperty({
        description: 'Flag indicating if the discount is expired',
    })
    isExpired: boolean;
}
