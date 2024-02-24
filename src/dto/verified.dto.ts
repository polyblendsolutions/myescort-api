import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class AddVerifiedDto {
  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  verified: string;

  @IsOptional()
  @IsString()
  name: string;
}

export class FilterVerifiedDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsBoolean()
  visibility: boolean;
}

export class FilterVerifiedGroupDto {
  @IsOptional()
  @IsBoolean()
  isGroup: boolean;
}

export class OptionVerifiedDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateVerifiedDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  verified: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  status: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class GetVerifiedByIdsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  ids: string[];
}

export class FilterAndPaginationVerifiedDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterVerifiedDto)
  filter: FilterVerifiedDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterVerifiedGroupDto)
  filterGroup: FilterVerifiedGroupDto;

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
