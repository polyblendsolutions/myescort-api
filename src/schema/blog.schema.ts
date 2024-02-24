import * as mongoose from 'mongoose';

export const BlogSchema = new mongoose.Schema(
  {
    readOnly: {
      type: Boolean,
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    bannerImage: {
      type: String,
      required: false,
    },

    userImage: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
    userDesignation: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },

    shortDescription: {
      type: String,
      required: false,
    },


    seoTitle: {
      type: String,
      required: false,
    },
    seoDescription: {
      type: String,
      required: false,
    },

    keyWord: {
      type: String,
      required: false,
    },

    url: {
      type: String,
      required: false,
    },
    priority: {
      type: Number,
      required: true,
    },
    isHtml: {
      type: Boolean,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);