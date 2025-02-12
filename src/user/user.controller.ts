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

    // Bearer required endpoints
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
    async getProfile(
        @Req() req: Request | any,
        @Res() res: Response
    ) {
        const { logger } = res.locals;
        try {
            const userId = req?.user?._id; //  user id from token
            const user = await this.userService.findById(userId);

            if (!user) return res.send(SystemResponse.notFoundError('User not found!', user));

            logger.info({ message: 'User fetched successfully', data: user, });


            const userData = {
                name: user.name,
                email: user.email,
                birthdate: user.birthdate,
                preferences: user.preferences
            }
            return res.send(SystemResponse.success('User fetched successfully', userData));

        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error fetching user', err.message));
        }
    }


    /**
    * @description Get product suggestions based on user's preferences
    * @returns List of suggested products
    */
    @Get('suggestions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth() // Indicates token is required
    @ApiOperation({ summary: 'Get product suggestions based on user preferences' })
    @ApiResponse({ status: 200, description: 'Product suggestions fetched successfully' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async getProductSuggestions(
        @Req() req: Request | any,
        @Res() res: Response
    ) {
        const { logger } = res.locals;

        try {

            const userId = req?.user?._id; // userid from token

            if (!userId) return res.send(SystemResponse.notFoundError('User ID not found in the token!', userId));

            const products = await this.userService.getProductSuggestions(userId);

            if (!products) return res.send(SystemResponse.notFoundError('No products found for the user!', products));


            logger.info({ message: 'Products fetched successfully!', data: products });

            return res.send(SystemResponse.success('Products fetched successfully', products));

        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error fetching product suggestions', err.message));
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
    @ApiOperation({ summary: 'User Creation' })
    @ApiResponse({ status: 200, description: 'User created successfully' })
    @ApiResponse({ status: 404, description: 'Not found' })
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

            if (!isUserCreated) return res.send(SystemResponse.notFoundError('Unable to create user!', isUserCreated));

            // Generate JWT token
            const token = await this.authService.generateToken(isUserCreated);

            logger.info({
                message: 'User created successfully!',
                data: [],
                option: [],
            });
            const userData = { name: isUserCreated?.name, email: isUserCreated?.email }

            return res.send(SystemResponse.success('User created successfully!', { userData, token }));

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

    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, description: 'Logged in successfully' })
    @ApiResponse({ status: 404, description: 'Not found' })
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
            const { _id,
                name,
                email,
                birthdate,
                preferences } = user

            const userData = {
                _id,
                name,
                email,
                birthdate,
                preferences
            }
            return res.send(SystemResponse.success('Login successful!', { userData, token }));
        } catch (err) {
            return res.send(SystemResponse.internalServerError('Error', err.message));
        }
    }




    /**
     * API created just for understanding to display list of users 
     * who has their birthday in between next 7 days
     */
    @Get()
    @ApiOperation({ summary: 'Get users who has birthday in this week' })
    @ApiResponse({ status: 200, description: 'Users fetched successfully' })
    @ApiResponse({ status: 404, description: 'Not found' })
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
    @Get('reset')
    async resetCodeGen(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string
    ) {

        this.userService.resetNotifications();
        return res.send(
            SystemResponse.success('Notification state reset successfully!')
        )
    }

}
