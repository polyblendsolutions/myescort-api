import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { ProductSchema } from '../../../schema/product.schema';
import { RegionSchema } from '../../../schema/region.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Region', schema: RegionSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  providers: [RegionService],
  controllers: [RegionController],
})
export class RegionModule {}
