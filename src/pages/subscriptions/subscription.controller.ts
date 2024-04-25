import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import { SubscriptionService } from './subscription.service';
import { AddSubscriptionDto } from '../../dto/subscription.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';

@Controller('subscription')
export class SubscriptionController {
    
  constructor(private subscriptionService: SubscriptionService) {}

  @Version(VERSION_NEUTRAL)
  @Get('/')
  async getSubscriptions(
  ): Promise<ResponsePayload> {
    return await this.subscriptionService.getSubscriptions();
  }

  /**
   * addSubscription
   *
   * @param addSubscriptionDto
   */
  @Version(VERSION_NEUTRAL)
  @Post('/add')
  @UsePipes(ValidationPipe)
  async addSubscription(
    @Body()
    body: AddSubscriptionDto,
  ): Promise<ResponsePayload> {
    return this.subscriptionService.createSubscription(body);
  }
}
