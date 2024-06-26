import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DiscountPercentController } from './discount-percent.controller';
import { DiscountPercentService } from './discount-percent.service';
import { DiscountPercentSchema } from '../../schema/discount-percent.schema';
import { ProductSchema } from '../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DiscountPercent', schema: DiscountPercentSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  controllers: [DiscountPercentController],
  providers: [DiscountPercentService],
})
export class DiscountPercentModule {}
