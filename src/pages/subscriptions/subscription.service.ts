import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../interfaces/common/product.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { AddSubscriptionDto } from '../../dto/subscription.dto';

@Injectable()
export class SubscriptionService {

  constructor(
    @InjectModel('Subscription') private readonly subscriptionModel: Model<Product>,
  ) {}

  async getSubscriptions(): Promise<ResponsePayload> {
    try {
      const subscriptions = await this.subscriptionModel.find().lean(true).sort({ days: -1 });
      return {
        success: true,
        message: 'Success',
        data: subscriptions,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async createSubscription(data: AddSubscriptionDto): Promise<ResponsePayload> {
    try {
      const subscriptionData = await this.subscriptionModel.create(data);
      if (!subscriptionData) {
        throw new BadRequestException('Subscription not created!');
      }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
