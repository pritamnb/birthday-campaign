import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.userService.findById(id);
    }

    @Get()
    async getBirthdayUsers() {
        return this.userService.getBirthdayUsers();
    }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get(':id/suggestions')
    async getProductSuggestions(@Param('id') id: string) {
        return this.userService.getProductSuggestions(id);
    }
}
