import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'User email',
        example: 'test@gmail.com',
    })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'userPassword123',
    })
    password: string;
}
