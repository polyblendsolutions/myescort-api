import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { JwtUserStrategy } from './jwt-user.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PASSPORT_USER_TOKEN_TYPE } from '../../core/global-variables';
import { OtpSchema } from '../../schema/otp.schema';
import { PromoOfferSchema } from '../../schema/promo-offer.schema';
import { UserSchema } from '../../schema/user.schema';
import { OtpService } from '../otp/otp.service';
import { SubscriptionsSchema } from 'src/schema/subscriptions.schema';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: PASSPORT_USER_TOKEN_TYPE,
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('userJwtSecret'),
        signOptions: {
          expiresIn: configService.get<number>('userTokenExpiredTime'),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'PromoOffer', schema: PromoOfferSchema },
      { name: 'Otp', schema: OtpSchema },
      { name: 'Subscriptions', schema: SubscriptionsSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtUserStrategy, OtpService],
  exports: [PassportModule],
})
export class UserModule {}
