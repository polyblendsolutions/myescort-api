import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

enum VerifiedStatus {
  Unverified = 0,
  Pending = 1,
  Verified = 2,
  Rejected = 3
}

export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
      unique: false,
    },
    conformPassword: {
      type: String,
      required: false,
      unique: false,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: false,
    },
    whatsappNo: {
      type: String,
      required: false,
    },
    homePageUrl: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    zipCode: {
      type: String,
      required: false,
    },
    region: {
      type: String,
      required: false,
    },
    area: {
      type: String,
      required: false,
    },
    zone: {
      type: String,
      required: false,
    },
    profileImg: {
      type: String,
    },
    registrationType: {
      type: String,
      required: false,
    },
    hasAccess: {
      type: Boolean,
      required: true,
    },
    images: {
      type: [String],
      required: false,
    },
    isVerfied: {
      type: Boolean,
      required: false,
    },
    verifiedStatus: {
      type: Number,
      required: false,
      enum: Object.values(VerifiedStatus),
      default: VerifiedStatus.Unverified,
    },
    varifiedImage:{
      type: String,
      required: false,
    },
    verify: {
      type: Boolean,
      required: false,
    },
    facebook: {
      type: String,
      required: false,
    },
    twiter: {
      type: String,
      required: false,
    },
    youtube: {
      type: String,
      required: false,
    },
    instagram: {
      type: String,
      required: false,
    },
    linkedin: {
      type: String,
      required: false,
    },
    pinterest: {
      type: String,
      required: false,
    },
    reddit: {
      type: String,
      required: false,
    },
    carts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
      },
    ],
    addresses: {
      type: String,
      required: false,
    },
    usedCoupons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
