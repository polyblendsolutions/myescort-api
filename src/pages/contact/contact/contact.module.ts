import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactSchema } from '../../../schema/contact.schema';
import { UserSchema } from '../../../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Contact', schema: ContactSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
