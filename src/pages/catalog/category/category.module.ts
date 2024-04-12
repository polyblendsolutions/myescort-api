import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategorySchema } from '../../../schema/category.schema';
import { ProductSchema } from '../../../schema/product.schema';
import { SubCategorySchema } from '../../../schema/sub-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Category', schema: CategorySchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'SubCategory', schema: SubCategorySchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
