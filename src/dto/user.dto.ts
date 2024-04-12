import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { PaginationDto } from './pagination.dto';
import { GenderTypes } from '../enum/gender-types.enum';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsString()
  @IsIn([GenderTypes.MALE, GenderTypes.FEMALE, GenderTypes.OTHER])
  gender: string;
}

export class CreateSocialUserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  username: string;

  @IsNotEmpty()
  @IsString()
  registrationType: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(11)
  phone: string;

  @IsOptional()
  @IsString()
  @IsIn([GenderTypes.MALE, GenderTypes.FEMALE, GenderTypes.OTHER])
  gender: string;
}

export class CheckUserRegistrationDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class AuthUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  password: string;
}

export class AuthSocialUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  username: string;
}

export class UserSelectFieldDto {
  @IsOptional()
  @Matches(/^((?!password).)*$/)
  select: string;
}

export class FilterUserDto {
  @IsOptional()
  @IsBoolean()
  hasAccess: boolean;

  @IsOptional()
  @IsString()
  @IsIn([GenderTypes.MALE, GenderTypes.FEMALE, GenderTypes.OTHER])
  gender: string;

  @IsOptional()
  _id: any;
}

export class FilterAndPaginationUserDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterUserDto)
  filter: FilterUserDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  sort: object;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  select: any;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  username: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  newPassword: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isVerfied: boolean;

  @IsOptional()
  @IsOptional()
  @IsString()
  @IsIn([GenderTypes.MALE, GenderTypes.FEMALE, GenderTypes.OTHER])
  gender: string;
}
/**
 * Address dto
 */

export class AddAddressDto {
  @IsOptional()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(11)
  phone: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  addressType: string;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(11)
  phone: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  addressType: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class CheckUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;
}

export class CheckNewEmailDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  newEmail: string;
}
