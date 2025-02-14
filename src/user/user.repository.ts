import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as moment from 'moment';

@Injectable()
export class UserRepository {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findEmail(email: string): Promise<User> {
        const user = await this.userModel.find({ email }).exec();
        return user[0]
    }

    /**
     * 
     * @param createUserDto details
     * @returns created user
     */
    async create(createUserDto: any): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    /**
     * 
     * @returns List all the users who's birthdays are within 7 days
     */
    async getBirthdayUsers(): Promise<User[]> {
        const today = moment().startOf('day');
        const nextWeek = moment(today).add(7, 'days');

        // Extracting the month and day for both today and the next week
        const todayMonthDay = today.format('MM-DD');
        const nextWeekMonthDay = nextWeek.format('MM-DD');


        try {
            // Users whose birthdays are between today and 7 days from now, ignoring the year
            const users = await this.userModel.find({
                $expr: {
                    $and: [
                        {
                            $gte: [
                                { $dateToString: { format: "%m-%d", date: "$birthdate" } }, // Format birthdate as MM-DD
                                todayMonthDay  // Compared with today's month and day
                            ]
                        },
                        {
                            $lt: [
                                { $dateToString: { format: "%m-%d", date: "$birthdate" } }, // Format birthdate as MM-DD
                                nextWeekMonthDay // Compared with the next week's month and day
                            ]
                        }
                    ]
                }
            })
                .select(['email', '_id', 'name', 'birthdate', 'preferences', 'discountGenerated', 'notificationSent'])
                .exec();
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    /**
     * To update users notification sent status 
     * @param userId string
     * @param notificationSent boolean
     * @param discountGenerated boolean
     */
    async updateNotificationStatus(userId: string, notificationSent: boolean, discountGenerated: boolean): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (user) {
            user.notificationSent = notificationSent;
            user.discountGenerated = discountGenerated;
            await user.save();
        }
    }

    /**
     * Filter those users who's birthdate is passed and not within next 7 days
     */
    async resetNotifications(): Promise<void> {
        const today = moment().startOf('day');
        const nextWeek = moment(today).add(7, 'days');
        const todayMonthDay = today.format('MM-DD');
        const nextWeekMonthDay = nextWeek.format('MM-DD');
        console.log("Reset notification");

        try {
            const users = await this.userModel.find({
                notificationSent: true,
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

            for (const user of users) {
                user.notificationSent = false;
                user.discountGenerated = false;
                await user.save();
            }
        } catch (error) {
            console.error('Error resetting notifications:', error);
        }
    }
}
