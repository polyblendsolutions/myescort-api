import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JobSchedulerService } from './job-scheduler.service';
import { JobSchedulerSchema } from '../../schema/job-scheduler.schema';
import { PromoOfferSchema } from '../../schema/promo-offer.schema';
import { ProductSchema } from 'src/schema/product.schema';
import { UserSchema } from 'src/schema/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'JobScheduler', schema: JobSchedulerSchema },
      { name: 'PromoOffer', schema: PromoOfferSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [JobSchedulerService],
  exports: [JobSchedulerService],
})
export class JobSchedulerModule {}
