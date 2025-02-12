
import { IsString, IsEmail, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



export class CreateUserDto {
    @ApiProperty({
        description: 'Name of the user',
    })
    name: string;

    @ApiProperty({
        description: 'Email of the user',
    })
    email: string;

    @ApiProperty({
        description: 'Birthdate of the user',
        type: String, // You could also use Date, but it's better to use string for Swagger
    })
    birthdate: string;


    @IsOptional()
    @IsArray()
    @ApiProperty({
        description: 'User preferences',
        enum: ['vegetables',
            'dairy',
            'meat',
            'fruits',
            'Seafood',
            'Grains',
            'Dairy'
        ],
        isArray: true,
    })
    preferences?: string[];

}
