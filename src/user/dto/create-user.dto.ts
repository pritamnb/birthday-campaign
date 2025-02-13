
import { IsString, IsEmail, IsDateString, IsOptional, IsArray, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



export class CreateUserDto { //(Data Transfer Object)
    @ApiProperty({
        description: 'The unique identifier of the discount',
    })
    _id: string;

    @ApiProperty({
        description: 'Name of the user',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Email of the user',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password',
    })
    password: string;

    @ApiProperty({
        description: 'Birthdate of the user',
        example: '2025-02-12T00:00:00.000Z'
    })
    @IsDateString()
    birthdate: string;


    @IsOptional()
    @IsArray()
    @ApiProperty({
        description: 'User preferences',
        enum: [
            'vegetables',
            'dairy',
            'meat',
            'fruits',
            'Seafood',
            'Grains'
        ],
        isArray: true,
    })
    preferences?: string[];

}
