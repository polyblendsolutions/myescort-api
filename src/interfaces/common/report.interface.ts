import { Product } from './product.interface';
import { User } from '../user/user.interface';

export interface Report {
  _id?: string;
  user?: string | User;
  product?: string | Product;
  name?: string;
  reportDate: string;
  report: string;
  rating: number;
  status: boolean;
  reply: string;
  replyDate: string;
}
