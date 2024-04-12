import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { AreaSchema } from '../../../schema/area.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Area', schema: AreaSchema }])],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
