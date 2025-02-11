import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import * as moment from 'moment';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private notificationService: NotificationService
    ) { }

    async findById(id: string): Promise<User | null> {
        // const eligibleUsers = await this.getEligible();
        // console.log('Eligible users found:', eligibleUsers);
        return this.userModel.findById(id).exec();
    }



    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async getProductSuggestions(userId: string): Promise<string[]> {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new Error('User not found');
        }

        const suggestions = this.getSuggestionsBasedOnPreferences(user.preferences);

        return suggestions;
    }

    private getSuggestionsBasedOnPreferences(preferences: string[]): string[] {
        const allProducts = {
            fruits: ['Apple', 'Banana', 'Orange', 'Mango'],
            vegetables: ['Carrot', 'Potato', 'Spinach', 'Tomato'],
            dairy: ['Milk', 'Cheese', 'Yogurt'],
        };

        const suggestedProducts: string[] = [];

        preferences.forEach(preference => {
            if (allProducts[preference]) {
                suggestedProducts.push(...allProducts[preference]);
            }
        });

        return suggestedProducts;
    }


    /**
     * 
     */


    async getBirthdayUsers(): Promise<User[]> {
        const today = moment().startOf('day');
        const nextWeek = moment(today).add(7, 'days');

        // Extract the month and day for both today and the next week
        const todayMonthDay = today.format('MM-DD');
        const nextWeekMonthDay = nextWeek.format('MM-DD');

        console.log('Query parameters:', { todayMonthDay, nextWeekMonthDay });

        try {
            // Find users whose birthdays are between today and 7 days from now, ignoring the year
            const users = await this.userModel.find({
                $expr: {
                    $and: [
                        {
                            $gte: [
                                { $dateToString: { format: "%m-%d", date: "$birthdate" } }, // Format birthdate as MM-DD
                                todayMonthDay  // Compare with today's month and day
                            ]
                        },
                        {
                            $lt: [
                                { $dateToString: { format: "%m-%d", date: "$birthdate" } }, // Format birthdate as MM-DD
                                nextWeekMonthDay // Compare with the next week's month and day
                            ]
                        }
                    ]
                }
            }).exec();
            for (const user of users) {
                const emailSubject = 'Happy Birthday! Enjoy Your Special Day!';
                const emailText = `Hello ${user.name},\n\nWe wish you a very Happy Birthday! Enjoy your special day with some great product recommendations from us.\n\nBest regards,\nYour Farmers Market Team`;

                // Send email to each eligible user
                await this.notificationService.sendEmail(user.email, emailSubject, emailText);
            }
            console.log('Found users:', users);
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        console.log('Running cron job to find eligible users...');
        const eligibleUsers = await this.getBirthdayUsers();
        console.log('Eligible users found:', eligibleUsers);
        for (const user of eligibleUsers) {
            const emailSubject = 'Happy Birthday! Enjoy Your Special Day!';
            const emailText = `Hello ${user.name},\n\nWe wish you a very Happy Birthday! Enjoy your special day with some great product recommendations from us.\n\nBest regards,\nYour Farmers Market Team`;

            // Send email to each eligible user
            await this.notificationService.sendEmail(user.email, emailSubject, emailText);
        }
    }
}
