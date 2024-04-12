import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BannerCaroselController } from './banner-carosel.controller';
import { BannerCaroselService } from './banner-carosel.service';
import { BannerCaroselSchema } from '../../../schema/banner-carosel.schema';
import { UserSchema } from '../../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BannerCarosel', schema: BannerCaroselSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [BannerCaroselService],
  controllers: [BannerCaroselController],
})
export class BannerCaroselModule {}
