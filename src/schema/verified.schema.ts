const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export const VerifiedSchema = new mongoose.Schema(
  {
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      name: {
        type: String,
      },
      profileImg: {
        type: String,
      },
    },
    verifiedDate: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
