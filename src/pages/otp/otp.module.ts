import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema } from '../../schema/otp.schema';
import { UserSchema } from "../../schema/user.schema";

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Otp', schema: OtpSchema },
    { name: 'User', schema: UserSchema },
  ])],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
