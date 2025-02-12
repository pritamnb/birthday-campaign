import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import { SystemResponse } from 'src/libs/response-handler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('User Services')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    /**
     * 
     * @param user id 
     * @returns get particular user's details
     */
    @Get(':id')
    async getUser(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string
    ) {
        const { logger } = res.locals;
        try {
            const user = await this.userService.findById(id);
            if (!user) return res.send(SystemResponse.notFoundError('User not found!', user))
            logger.info({
                message: 'User fetched successfully',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('User fetched successfully', user),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }


    /**
     * Creates new user
     */
    @Post()
    @ApiBody({
        description: 'User creation data',
        type: CreateUserDto,
        examples: {
            'application/json': {
                value: {
                    name: "Test",
                    email: "test@gmail.com",
                    birthdate: "1997-02-15",
                    preferences: ["vegetables", "dairy"]
                }
            }
        }
    })
    async createUser(
        @Req() req: Request,
        @Res() res: Response,
        @Body() createUserDto: CreateUserDto
    ) {
        const { logger } = res.locals;
        try {
            const isUserCreated = await this.userService.create(createUserDto);

            if (!isUserCreated) return res.send(SystemResponse.notFoundError('Unable to create user!', isUserCreated));

            logger.info({
                message: 'User created successfully!',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('User created successfully!', isUserCreated),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }

    @Get(':id/suggestions')
    async getProductSuggestions(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string
    ) {

        const { logger } = res.locals;
        try {
            const isUser = await this.userService.getProductSuggestions(id);

            if (!isUser) return res.send(SystemResponse.notFoundError('No user found!', isUser));

            logger.info({
                message: 'Products fetch successfully!',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('Products fetch successfully!', isUser),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }


    /**
     * API created just for understanding to display list of users who has their birthday in between next 7 days
     */
    @Get()
    async getBirthdayUsers(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { logger } = res.locals;
        try {
            // const users = await this.userService.getBirthdayUsers();
            const users: any = await this.userService.handleCron(); // To run the cron job manually Not recommended

            if (!users) return res.send(SystemResponse.notFoundError('Users not found!', users))

            logger.info({
                message: 'Birthday users fetched successfully',
                data: [],
                option: [],
            });
            return res.send(
                SystemResponse.success('Birthday users fetched successfully', users),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }


    /**
     * 
     *API created to reset all the users code and notification flags to default 
     */
    @Get(':id/reset')
    async resetCodeGen(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string
    ) {
        console.info("id :: ", id);
        this.userService.resetNotifications();
        return res.send(
            SystemResponse.success('Users who do not have their birthdays in next 7 days are set to default successfully!')
        )
    }

}
