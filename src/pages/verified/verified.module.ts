import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerifiedSchema } from 'src/schema/verified.schema';

import { AdminSchema } from './../../schema/admin.schema';
import { VerifiedController } from './verified.controller';
import { VerifiedService } from './verified.service';
import { UserSchema } from '../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Verified', schema: VerifiedSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [VerifiedController],
  providers: [VerifiedService],
})
export class VerifiedModule {}
