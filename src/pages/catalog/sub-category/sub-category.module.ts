import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubCategoryController } from './sub-category.controller';
import { SubCategoryService } from './sub-category.service';
import { ProductSchema } from '../../../schema/product.schema';
import { SubCategorySchema } from '../../../schema/sub-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SubCategory', schema: SubCategorySchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
})
export class SubCategoryModule {}
