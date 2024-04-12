import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema } from 'src/schema/review.schema';

import { AdminSchema } from './../../schema/admin.schema';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ProductSchema } from '../../schema/product.schema';
import { UserSchema } from '../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Review', schema: ReviewSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
