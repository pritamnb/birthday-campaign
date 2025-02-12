import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async getSuggestedProducts(userId: string): Promise<Product[]> {
        const user = await this.userModel.findById(userId);
        console.info("user :: ", user);
        if (!user || !user.preferences || user.preferences.length === 0) {
            throw new Error('User not found or no preferences set');
        }

        const suggestedProducts = await this.productModel.find({
            category: { $in: user.preferences }
        })
            .collation({ locale: 'en', strength: 2 })
            .sort({ rating: 'desc' })
            .exec();

        console.info("suggestedProducts :: ", suggestedProducts);

        return suggestedProducts;
    }
    async getTopRatedProductByCategory(userId: string): Promise<Product[]> {
        // User and their preferences
        const user = await this.userModel.findById(userId);
        if (!user || !user.preferences || user.preferences.length === 0) {
            throw new NotFoundException('User not found or no preferences set');
        }

        // case-insensitive regex match
        const categoryConditions = user.preferences.map(pref => ({
            category: { $regex: pref, $options: 'i' }  // Case-insensitive regex for each category
        }));

        // To get top-rated products from the categories
        const topRatedProducts = await this.productModel.aggregate([
            {
                $match: {
                    $or: categoryConditions  // multiple regex conditions
                }
            },
            {
                $sort: { rating: -1 }
            },
            {
                $group: {
                    _id: "$category",
                    topProduct: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$topProduct" }  // Replace root with the top product details
            }
        ]);

        return topRatedProducts;
    }


    async loadProducts(products: Product[]): Promise<any> {
        return await this.productModel.insertMany(products);
    }
}
