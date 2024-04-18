import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const SubscriptionsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    days: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: false,
    }
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
