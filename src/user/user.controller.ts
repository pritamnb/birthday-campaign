import { Body, Controller, forwardRef, Get, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import { SystemResponse } from 'src/libs/response-handler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@ApiTags('User Services')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) { }

    /**
     * @description Get the details of the authenticated user
     * @param req Express Request object containing the user's JWT
     * @returns The user's details
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth() // Indicates token is required
    @ApiOperation({ summary: 'Get authenticated user details' })
    @ApiResponse({ status: 200, description: 'User details fetched successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getProfile(@Req() req: Request | any, @Res() res: Response) {
        const { logger } = res.locals;

        try {
            // Extract user ID from the JWT token payload
            const userId = req?.user['_id']; // Make sure JwtAuthGuard adds user info to request object
            console.log("userId : ", req.user);

            const user = await this.userService.findById(userId);
            if (!user) {
                return res.send(SystemResponse.notFoundError('User not found!', user));
            }

            logger.info({
                message: 'User fetched successfully',
                data: user,
            });
            const {
                name,
                email,
                birthdate,
                preferences
            } = user

            return res.send(SystemResponse.success('User fetched successfully', {
                name,
                email,
                birthdate,
                preferences
            }));
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error fetching user', err.message));
        }
    }
    /**
     * 
     * @param user id 
     * @returns get particular user's details
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
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
       * Creates a new user
       */
    @Post()
    @ApiBody({
        description: 'User creation data',
        type: CreateUserDto,
        examples: {
            'application/json': {
                value: {
                    name: 'Test',
                    email: 'test@gmail.com',
                    birthdate: '1997-02-15',
                    preferences: ['vegetables', 'dairy'],
                    password: 'userPassword123',
                },
            },
        },
    })
    async createUser(
        @Req() req: Request,
        @Res() res: Response,
        @Body() createUserDto: CreateUserDto,
    ) {

        const { logger } = res.locals;
        try {
            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            createUserDto.password = hashedPassword;

            // Create the user
            const isUserCreated = await this.userService.create(createUserDto);

            if (!isUserCreated)
                return res.send(SystemResponse.notFoundError('Unable to create user!', isUserCreated));

            // Generate JWT token
            const token = await this.authService.generateToken(isUserCreated);

            logger.info({
                message: 'User created successfully!',
                data: [],
                option: [],
            });
            const { name, email } = isUserCreated;
            return res.send(

                SystemResponse.success('User created successfully!', { user: { name, email }, token }),
            );
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }




    /**
       * Login and return a JWT token
       */
    @Post('login')
    @ApiBody({
        description: 'Login credentials',
        type: LoginDto,
        examples: {
            'application/json': {
                value: {
                    email: 'test@gmail.com',
                    password: 'userPassword123',
                },
            },
        },
    })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const { logger } = res.locals;

        try {
            // Find user by email
            const user = await this.userService.findByEmail(loginDto.email);

            if (!user) {
                return res.send(SystemResponse.notFoundError('User not found!', user));
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                return res.send(SystemResponse.unauthorizedError('Invalid credentials.', ''));
            }

            // Generate JWT token
            const token = await this.authService.generateToken(user);

            logger.info({
                message: 'User logged in successfully!',
                data: [],
                option: [],
            });

            return res.send(SystemResponse.success('Login successful!', { user, token }));
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }


    /**
     * 
     * @returns suggestion on products based on user's preferences
     */
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
     * API created just for understanding to display list of users 
     * who has their birthday in between next 7 days
     */
    @Get()
    async getBirthdayUsers(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { logger } = res.locals;
        try {
            const users = await this.userService.getBirthdayUsers();
            // const users: any = await this.userService.handleCron(); // To run the cron job manually Not recommended

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

        this.userService.resetNotifications();
        return res.send(
            SystemResponse.success('Users who do not have their birthdays in next 7 days are set to default successfully!')
        )
    }

}
