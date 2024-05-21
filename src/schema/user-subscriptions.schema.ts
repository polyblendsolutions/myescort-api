import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const UserSubscriptionsSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    }
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
