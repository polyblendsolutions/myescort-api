const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export const ReportSchema = new mongoose.Schema(
  {
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:false,
      },
      name: {
        type: String,
      },
      profileImg: {
        type: String,
      },
    },
    // product: {
    //   _id: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Product',
    //     required:false,
    //   },
    //   name: {
    //     type: String,
    //   },
    //   images: {
    //     type: String,
    //   },
    //   slug: {
    //     type: String,
    //   },
    // },
    reportDate: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    report: {
      type: String,
      required: false,
    },
    product: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
    reply: {
      type: String,
      required: false,
    },
    replyDate: {
      type: Date,
      required: false,
    },
    priority:{
      type: Number,
      required: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
