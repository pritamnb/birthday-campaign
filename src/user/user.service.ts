import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import * as moment from 'moment';
import { DiscountService } from 'src/discount/discount.service';
import { Discount, DiscountDocument } from 'src/discount/discount.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private notificationService: NotificationService,
        private discountService: DiscountService
    ) { }

    async findById(id: string): Promise<User | null> {
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
     * @returns 
     */


    async getBirthdayUsers(): Promise<User[]> {
        const today = moment().startOf('day');
        const nextWeek = moment(today).add(7, 'days');

        // Extracting the month and day for both today and the next week
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
        for (const user of eligibleUsers) {
            if (!user.notificationSent) {
                console.info('Notification sending');
                const { email } = user;
                const { emailSubject, html } = await this.generateTemplate(user);

                await this.notificationService.sendEmail(email, emailSubject, html);
                await this.notificationStatusUpdate(user['_id']);
                console.info('Notification sent!');

            }

        }
    }
    /**
     * 
     * @param userId 
     * It will update notification status to true when notification is sent
     */
    private async notificationStatusUpdate(userId: string) {
        const isUser = await this.userModel.findById(userId);
        if (isUser) {
            isUser.notificationSent = true;
            isUser.discountGenerated = true;
            await isUser.save();
        }
    }


    private async generateTemplate(user: User) {
        const { birthdate, name } = user;
        const startDate = moment(birthdate).subtract(7, 'days').format('MMMM D') + ' ' + moment().format('YYYY'); // 7 days before birthday
        const endDate = moment(birthdate).add(1, 'days').format('MMMM D') + ' ' + moment().format('YYYY'); // 1 day after birthday

        const discountCode = await this.discountService.generateDiscountCode(user['_id']);
        const emailSubject = `Your Birthday is Coming Up! Here’s a Special Gift for You !`;
        const html = `
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your birthday is just around the corner, and we couldn’t be more excited to celebrate with you! 🎉</p>
            <p>To make your special day even better, we’re giving you an <strong>exclusive birthday discount code</strong> that you can use during the week of your birthday.</p>
            <h2 style="color: #ff6600;">${discountCode}</h2>
            <p>📅 <strong>Valid From:</strong> ${startDate}</p>
            <p>⏳ <strong>Expires:</strong> ${endDate}</p>
            <p>💡 <strong>How to Redeem:</strong> Use this code at checkout when shopping on our app or website.</p>
            <p>We've also selected some amazing products that we think you’ll love!</p>
            
            <br>
            <p>We hope you have an amazing celebration! 🎂</p>
            <p>Best Wishes,</p>
            <p><strong>Company Name</strong></p>
            <p><a href="https://website.com">Website</a></p>
            <p>Need help? Contact us at <a href="mailto:support@test.com">support@test.com</a></p>
        `
        return { emailSubject, html };
    }


    async resetNotifications() {

        const today = moment().startOf('day');
        const nextWeek = moment(today).add(7, 'days');

        // Extracting the month and day for both today and the next week
        const todayMonthDay = today.format('MM-DD');
        const nextWeekMonthDay = nextWeek.format('MM-DD');
        // const users = await this.userModel.find({ notificationSent: true });
        const users = await this.userModel.find({
            $expr: {
                $or: [
                    {
                        $lt: [
                            { $dateToString: { format: "%m-%d", date: "$birthdate" } },
                            todayMonthDay // Birthdate is before today
                        ]
                    },
                    {
                        $gt: [
                            { $dateToString: { format: "%m-%d", date: "$birthdate" } },
                            nextWeekMonthDay // Birthdate is after the next week
                        ]
                    }
                ]
            }
        });

        console.info("users : ", users)
        for (const user of users) {
            const birthday = moment(user.birthdate);

            // If birthday week has passed, reset the notification flag
            if (birthday.isBefore(today, 'day')) {
                user.notificationSent = false;
                user.discountGenerated = false;
                await this.discountService.expireCode(user['_id']);
                await user.save();
                console.log(`Reset notification flag for user: ${user.email}`);
            }
        }
    }
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyReset() {
        await this.resetNotifications();
    }


}
