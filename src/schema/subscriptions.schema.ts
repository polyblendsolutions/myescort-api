import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const SubscriptionsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    }
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
