import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandSchema } from '../../../schema/brand.schema';
import { ProductSchema } from '../../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Brand', schema: BrandSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
