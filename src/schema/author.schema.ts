import * as mongoose from 'mongoose';

export const AuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    birthDate: {
      type:Date,
      required: false,
    },
    priority: {
      type: Number,
      required: false,
    },
    
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
