import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrientationController } from './orientation.controller';
import { OrientationService } from './orientation.service';
import { OrientationSchema } from '../../../schema/orientation.schema';
import { ProductSchema } from '../../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Orientation', schema: OrientationSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  providers: [OrientationService],
  controllers: [OrientationController],
})
export class OrientationModule {}
