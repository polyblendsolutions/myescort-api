import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { PRISING_MODULES_SUB_SCHEMA } from './sub-schema.schema';

export const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: false,
    },
    isVipStatusActive: {
      type: Boolean,
      default: false,
    },
    vipStatusActivatedOn: {
      type: Number,
      default: Date.now(),
    },
    shortId: {
      type: String,
      required: false,
      trim: false,
    },
    slug: {
      type: String,
      required: false,
      trim: false,
    },
    description: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      required: false,
    },
    // title: {
    //   type: String,
    //   required: false,
    // },
    age: {
      type: String,
      required: false,
    },
    height: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    acceptsPeople: {
      type: String,
      required: false,
    },
    runningOut: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      required: false,
    },
    openingHours: {
      type: [String],
      required: false,
    },
    dayHours: {
      type: [Object],
      required: false,
    },
    mondayHours: {
      type: [Object],
      required: false,
    },
    tuesdayHours: {
      type: [Object],
      required: false,
    },
    wednesdayHours: {
      type: [Object],
      required: false,
    },
    thursdayHours: {
      type: [Object],
      required: false,
    },
    fridayHours: {
      type: [Object],
      required: false,
    },
    saturdayHours: {
      type: [Object],
      required: false,
    },
    specialHours: {
      type: String,
      required: false,
    },
    monday: {
      type: Boolean,
      required: false,
    },
    mondaySlot: {
      type: Boolean,
      required: false,
    },
    tuesday: {
      type: Boolean,
      required: false,
    },
    tuesdaySlot: {
      type: Boolean,
      required: false,
    },
    wednesday: {
      type: Boolean,
      required: false,
    },
    pricing: {
      type: [PRISING_MODULES_SUB_SCHEMA],
      required: false,
    },
    wednesdaySlot: {
      type: Boolean,
      required: false,
    },
    thursday: {
      type: Boolean,
      required: false,
    },
    thursdaySlot: {
      type: Boolean,
      required: false,
    },
    friday: {
      type: Boolean,
      required: false,
    },
    fridaySlot: {
      type: Boolean,
      required: false,
    },
    newPricing: {
      type: Boolean,
      required: false,
    },
    saturday: {
      type: Boolean,
      required: false,
    },
    saturdaySlot: {
      type: Boolean,
      required: false,
    },
    zipCode: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    whatsApp: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    addContent: {
      type: String,
      required: false,
    },
    homePage: {
      type: String,
      required: false,
    },
    shortDescription: {
      type: String,
      required: false,
    },

    featureTitle: {
      type: String,
      required: false,
    },
    costPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: false,
      default: 0,
    },
    tax: {
      type: Number,
      required: false,
    },
    hasTax: {
      type: Boolean,
      required: false,
    },
    sku: {
      type: String,
      required: false,
      unique: false,
    },
    emiMonth: {
      type: [Number],
      required: false,
    },
    discountType: {
      type: Number,
      required: false,
    },
    discountAmount: {
      type: Number,
      required: false,
    },

    emiAmount: {
      type: Number,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    quantity: {
      type: Number,
      required: false,
      default: 0,
    },
    threeMonth: {
      type: Number,
      required: false,
      default: 0,
    },
    sixMonth: {
      type: Number,
      required: false,
      default: 0,
    },
    twelveMonth: {
      type: Number,
      required: false,
      default: 0,
    },
    cartLimit: {
      type: Number,
      required: false,
      default: 0,
    },
    trackQuantity: {
      type: Boolean,
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
    seoKeywords: {
      type: String,
      required: false,
    },
    category: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },

    bodyType: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'BodyType',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    subCategory: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    publisher: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Publisher',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Type',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    intimateHair: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'IntimateHair',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    hairColor: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'HairColor',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    orientation: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Orientation',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    division: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Division',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    area: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Area',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    zone: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Zone',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },

    author: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Author',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    brand: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      slug: {
        type: String,
        required: false,
      },
    },
    tags: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Tags',
          required: false,
        },
        name: {
          type: String,
          required: false,
        },
        slug: {
          type: String,
          required: false,
        },
      },
    ],
    hasVariations: {
      type: Boolean,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    discountStartDateTime: {
      type: Date,
      required: false,
    },
    discountEndDateTime: {
      type: Date,
      required: false,
    },
    videoUrl: {
      type: String,
      required: false,
    },
    specifications: {
      type: [Object],
      required: false,
    },
    features: {
      type: [Object],
      required: false,
    },
    totalSold: {
      type: Number,
      required: false,
      default: 0,
    },
    ratingAvr: {
      type: Number,
      required: false,
      default: 0,
    },
    ratingCount: {
      type: Number,
      required: false,
      default: 0,
    },
    ratingTotal: {
      type: Number,
      required: false,
      default: 0,
    },
    reviewTotal: {
      type: Number,
      required: false,
      default: 0,
    },
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
      images: {
        type: [String],
      },
      isVerfied: {
        type: Boolean,
        required: false,
      },
    },
    isFeatured: {
      type: Boolean,
      required: false,
    },
    isRegion: {
      type: Boolean,
      required: false,
    },
    userActive: {
      type: Boolean,
      required: false,
    },
    publishDate: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
