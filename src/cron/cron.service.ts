import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CronService {
    constructor(private readonly userService: UserService) { }
    /**
     * A CRON job that runs every midnight
     * Lists all eligible users and sends notifications
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            const eligibleUsers = await this.userService.getBirthdayUsers();
            for (const user of eligibleUsers) {
                // Check if notification and discount were not sent
                if (!user.notificationSent && !user.discountGenerated) {
                    await this.userService.sendBirthdayNotification(user);
                }
            }
            // Reset notification status
            await this.userService.resetNotifications();
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    }
}
