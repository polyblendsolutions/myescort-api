import * as mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema(
  {
    readOnly: {
      type: Boolean,
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: false,
    },
    slug: {
      type: String,
      required: true,
      trim: false,
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    mobileImage: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    serial: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: false,
      default: 'publish',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
