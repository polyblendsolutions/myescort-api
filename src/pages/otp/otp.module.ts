import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpSchema } from '../../schema/otp.schema';
import { UserSchema } from '../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Otp', schema: OtpSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
