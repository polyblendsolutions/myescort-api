import * as mongoose from 'mongoose';

export const TagSchema = new mongoose.Schema(
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
