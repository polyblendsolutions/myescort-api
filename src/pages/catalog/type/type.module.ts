import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TypeController } from './type.controller';
import { TypeService } from './type.service';
import { ProductSchema } from '../../../schema/product.schema';
import { TypeSchema } from '../../../schema/type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Type', schema: TypeSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  providers: [TypeService],
  controllers: [TypeController],
})
export class TypeModule {}
