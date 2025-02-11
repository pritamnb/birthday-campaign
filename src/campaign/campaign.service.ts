import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CampaignService {
    constructor(
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
    ) { }

    async startCampaign() {
        // const eligibleUsers = await this.userService.findEligibleUsers();

        // eligibleUsers.forEach(user => {
        //     const discountCode = uuidv4();
        //     this.sendCampaignEmail(user, discountCode);
        // });
    }

    private async sendCampaignEmail(user, discountCode) {
        const emailBody = `
      Hello ${user.name},
      Happy Birthday! Here's a special discount just for you: ${discountCode}
    `;
        const subject = "Birthday discount!";
        await this.notificationService.sendEmail(user.email, subject, emailBody);
    }
}
