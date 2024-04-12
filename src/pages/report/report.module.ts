import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from 'src/schema/report.schema';

import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { AdminSchema } from '../../schema/admin.schema';
import { ProductSchema } from '../../schema/product.schema';
import { UserSchema } from '../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Report', schema: ReportSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
