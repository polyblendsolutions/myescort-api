import { Product } from './product.interface';
import { User } from '../user/user.interface';

export interface Verified {
  _id?: string;
  user?: string | User;
  name?: string;
  verifiedDate: string;
  status: boolean;
}
