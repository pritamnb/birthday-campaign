import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { DiscountService } from 'src/discount/discount.service';
import { ProductService } from 'src/product/product.service';
import * as moment from 'moment';

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

    async create(createUserDto: CreateUserDto): Promise<any> {
        return this.userRepository.create(createUserDto);
    }

    async getProductSuggestions(userId: string): Promise<string[]> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return this.getSuggestionsBasedOnPreferences(user.preferences);
    }

    private getSuggestionsBasedOnPreferences(preferences: string[]): string[] {
        const allProducts = {
            fruits: ['Apple', 'Banana', 'Orange', 'Mango'],
            vegetables: ['Carrot', 'Potato', 'Spinach', 'Tomato'],
            dairy: ['Milk', 'Cheese', 'Yogurt'],
        };

        const suggestedProducts: string[] = [];

        preferences.forEach((preference) => {
            if (allProducts[preference]) {
                suggestedProducts.push(...allProducts[preference]);
            }
        });

        return suggestedProducts;
    }

    async getBirthdayUsers(): Promise<any> {
        return this.userRepository.getBirthdayUsers();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        console.log('Running cron job to find eligible users...');
        try {
            const eligibleUsers = await this.getBirthdayUsers();
            for (const user of eligibleUsers) {
                if (!user.notificationSent && !user.discountGenerated) {
                    await this.sendBirthdayNotification(user);
                }
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    }

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

    async resetNotifications() {
        await this.userRepository.resetNotifications();
    }
}
