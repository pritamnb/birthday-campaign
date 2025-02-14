import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { DiscountService } from 'src/discount/discount.service';
import { ProductService } from 'src/product/product.service';
import * as moment from 'moment';
import { Product } from 'src/product/product.schema';

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private notificationService: NotificationService,
        private discountService: DiscountService,
        private productService: ProductService
    ) { }

    async findById(id: string): Promise<any> {
        return this.userRepository.findById(id);
    }
    async findByEmail(email: string): Promise<any> {
        return this.userRepository.findEmail(email);
    }

    async create(createUserDto: CreateUserDto): Promise<any> {
        return this.userRepository.create(createUserDto);
    }

    async getProductSuggestions(userId: string): Promise<Product[]> {
        return await this.productService.getTopRatedProductByCategory(userId);
    }



    async getBirthdayUsers(): Promise<any> {
        return this.userRepository.getBirthdayUsers();
    }

    /**
     * 
     * @param user details
     * Being called from cron job sends notification and update the status
     */
    private async sendBirthdayNotification(user: any) {
        try {
            const { email } = user;
            const { emailSubject, html } = await this.generateTemplate(user);

            await this.notificationService.sendEmail(email, emailSubject, html);
            await this.userRepository.updateNotificationStatus(user.id, true, true);
            console.info('Notification sent!');
        } catch (error) {
            console.error('Error sending birthday notification:', error);
        }
    }

    /**
     * 
     * @param user details
     * @returns email subject and html(wishes, a code and personalized products)
     */
    private async generateTemplate(user: any) {
        const { birthdate, name } = user;
        const startDate = moment(birthdate)
            .subtract(7, 'days')
            .format('MMMM D') + ' ' + moment().format('YYYY');
        const endDate =
            moment(birthdate).add(1, 'days').format('MMMM D') + ' ' + moment().format('YYYY');

        const discountCode = await this.discountService.generateDiscountCode(user.id);
        const emailSubject = `Your Birthday is Coming Up! Here’s a Special Gift for You!`;

        let topRatedProducts;
        try {
            topRatedProducts = await this.productService.getTopRatedProductByCategory(user.id);
        } catch (error) {
            console.error(`Error fetching top-rated products for user ${user.id}:`, error);
            topRatedProducts = [];
        }

        const categoryMap: Record<string, string[]> = {};

        topRatedProducts.forEach((product) => {
            if (product.category) {
                if (!categoryMap[product.category]) {
                    categoryMap[product.category] = [];
                }

                const rating = product.rating ?? 0;
                const stars = '⭐'.repeat(Math.round(rating));

                categoryMap[product.category].push(`${product.name} (${stars || 'No rating'})`);
            }
        });

        let productsHtml = '';
        if (Object.keys(categoryMap).length > 0) {
            productsHtml = '<h3>🌟 Most Purchased Products:</h3>';
            Object.keys(categoryMap).forEach((category) => {
                productsHtml += `<p><strong>${category}:</strong> ${categoryMap[category].join(', ')}</p>`;
            });
        } else {
            productsHtml = '<p>No recommended products at this time.</p>';
        }

        const html = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your birthday is just around the corner, and we couldn’t be more excited to celebrate with you! 🎉</p>
      <p>To make your special day even better, we’re giving you an <strong>exclusive birthday discount code</strong> that you can use during the week of your birthday.</p>
      <h2 style="color: #ff6600;">${discountCode}</h2>
      <p>📅 <strong>Valid From:</strong> ${startDate}</p>
      <p>⏳ <strong>Expires:</strong> ${endDate}</p>
      <p>💡 <strong>How to Redeem:</strong> Use this code at checkout when shopping on our app or website.</p>
      ${productsHtml}
      <br>
      <p>We hope you have an amazing celebration! 🎂</p>
      <p>Best Wishes,</p>
      <p><strong>Company Name</strong></p>
      <p><a href="https://website.com">Website</a></p>
      <p>Need help? Contact us at <a href="mailto:support@test.com">support@test.com</a></p>
    `;

        return { emailSubject, html };
    }

    /**
     * resets all the notification and code generated flags back to false 
     * so that next time it won't be an issue to generate and send notification
     */
    async resetNotifications() {
        await this.userRepository.resetNotifications();
    }



    /**
     * A CRON job which runs at every midnight 
     * lists all the eligible users and send notification to them
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        console.log('Running cron job to find eligible users...');
        try {
            const eligibleUsers = await this.getBirthdayUsers();
            for (const user of eligibleUsers) {
                // notification and discount code not generated user filtering
                if (!user.notificationSent && !user.discountGenerated) {
                    await this.sendBirthdayNotification(user);
                }
            }
            // resent notification and code gen status of a user
            await this.resetNotifications();
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    }

}
