import { Product } from './product.interface';
import { User } from '../user/user.interface';

export interface Cart {
  _id?: string;
  product?: Product;
  user?: string | User;
  selectedQty?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
