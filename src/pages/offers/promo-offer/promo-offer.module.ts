import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PromoOfferController } from './promo-offer.controller';
import { PromoOfferService } from './promo-offer.service';
import { PromoOfferSchema } from '../../../schema/promo-offer.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'PromoOffer', schema: PromoOfferSchema }])],
  controllers: [PromoOfferController],
  providers: [PromoOfferService],
})
export class PromoOfferModule {}
