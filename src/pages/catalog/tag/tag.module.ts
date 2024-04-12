import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { ProductSchema } from '../../../schema/product.schema';
import { TagSchema } from '../../../schema/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tag', schema: TagSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  providers: [TagService],
  controllers: [TagController],
})
export class TagModule {}
