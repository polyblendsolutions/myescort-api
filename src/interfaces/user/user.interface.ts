export interface User {
  _id?: string;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  phoneNo?: string;
  confirmPassword?: string;
  varifiedImage?: string;
  phone?: string;
  email?: string;
  image?: string;
  images?: string[];
  password?: string;
  conformPassword?: string;
  gender?: string;
  profileImg?: string;
  date?: Date;
  occupation?: string;
  hasAccess?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  success: boolean;

  isVerfied?: boolean;
  verify?: boolean;
}

export interface UserAuthResponse {
  success: boolean;
  token?: string;
  tokenExpiredIn?: number;
  data?: any;
  message?: string;
}

export interface UserJwtPayload {
  _id?: string;
  username: string;
}
