import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponSchema } from '../../../schema/coupon.schema';
import { UserSchema } from '../../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Coupon', schema: CouponSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
