
import { IsString, IsEmail, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsDateString()
    birthdate: Date;

    @IsOptional()
    @IsArray()
    preferences?: string[];

}
