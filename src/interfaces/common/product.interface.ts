import { User } from "../user/user.interface";

export interface Product {
  _id?: string;
  name: string;
  slug?: string;
  verified?: boolean;
  description?: string;
  priceValue?: number;
  addContent?: string;
  newPricing?: boolean;
  isRegion?: boolean;

  timing?: string;
  serviceDescription?: string;
  shortDescription?: string;
  title?: string;
  age?: string;
  height?: string;
  weight?: string;
  acceptsPeople?: string;
  runningOut?: string;
  size?: string;
  openingHours?: string[];
  zipCode?: string;
  address?: string;
  phone?: string;
  specialHours?: string;
  whatsApp?: string;
  email?: string;
  homePage?: string;
  featureTitle?: string;
  costPrice?: number;
  salePrice: number;
  hasTax?: boolean;
  tax?: number;
  sku: string;
  emiMonth?: number[];
  threeMonth?: number;
  emiAmount?: number;
  sixMonth?: number;
  twelveMonth?: number;
  discountType?: number;
  discountAmount?: number;
  images?: string[];
  user?: User;
  trackQuantity?: boolean;
  quantity?: number;
  cartLimit?: number;
  category?: CatalogInfo;
  subCategory?: CatalogInfo;
  brand?: CatalogInfo;
  publisher?: CatalogInfo;
  author?: CatalogInfo;
  intimateHair?: CatalogInfo;
  hairColor?: CatalogInfo;
  orientation?: CatalogInfo;
  region?: CatalogInfo;
  type?: CatalogInfo;
  tags?: string[];
  status?: string;
  // Seo
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Point
  earnPoint?: boolean;
  pointType?: number;
  pointValue?: number;
  redeemPoint?: boolean;
  redeemType?: number;
  redeemValue?: number;
  pricing?: pricingData[];
  // Discount Date Time
  discountStartDateTime?: Date;
  discountEndDateTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
  mondayHours?: { startHour?: string; endHour?: string }[];
  tuesdayHours?: { startHour?: string; endHour?: string }[];
  wednesdayHours?: { startHour?: string; endHour?: string }[];
  thursdayHours?: { startHour?: string; endHour?: string }[];
  fridayHours?: { startHour?: string; endHour?: string }[];
  saturdayHours?: { startHour?: string; endHour?: string }[];
}

interface CatalogInfo {
  _id: string;
  name: string;
  slug: string;
}
export interface pricingData {
  _id?: string;
  serviceDescription?: string;
  timing?: string;
  priceValue?: string;
}