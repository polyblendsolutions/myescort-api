import { Product } from './product.interface';
import { User } from '../user/user.interface';

export interface WishList {
  _id?: string;
  product?: string | Product;
  user?: string | User;
  selectedQty?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
