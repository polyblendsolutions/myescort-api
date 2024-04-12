import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DivisionController } from './division.controller';
import { DivisionService } from './division.service';
import { AreaSchema } from '../../../schema/area.schema';
import { DivisionSchema } from '../../../schema/division.schema';
import { ZoneSchema } from '../../../schema/zone.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Division', schema: DivisionSchema },
      { name: 'Area', schema: AreaSchema },
      { name: 'Zone', schema: ZoneSchema },
    ]),
  ],
  controllers: [DivisionController],
  providers: [DivisionService],
})
export class DivisionModule {}
