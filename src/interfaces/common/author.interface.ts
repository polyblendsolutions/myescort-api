export interface Author {
  _id?: string;
  name?: string;
  slug?: string;
  address?: string;
  description?: string;
  image?: string;
  birthDate?: Date;
  priority?:number;
  createdAt?: Date;
  updatedAt?: Date;
}
