import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationService {
    async getRecommendations(userId: number): Promise<string[]> {
        // Mocking the recommendation logic
        return [
            'Product 1: Recommended because of your past purchases.',
            'Product 2: Based on your preferences.',
        ];
    }
}
