import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class AddSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  days: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

