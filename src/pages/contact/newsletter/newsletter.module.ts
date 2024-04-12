import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterSchema } from '../../../schema/newsletter.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Newsletter', schema: NewsletterSchema }])],
  providers: [NewsletterService],
  controllers: [NewsletterController],
})
export class NewsletterModule {}
