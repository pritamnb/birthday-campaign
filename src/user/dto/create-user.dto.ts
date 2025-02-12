
import { IsString, IsEmail, IsDateString, IsOptional, IsArray, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



export class CreateUserDto {
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
        description: 'Birthdate of the user'
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
