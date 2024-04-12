import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { GetTokenUser } from '../../decorator/get-token-user.decorator';
import { AddCartDto, UpdateCartDto, UpdateCartQty } from '../../dto/cart.dto';
import { UserJwtAuthGuard } from '../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('cart')
export class CartController {
  private logger = new Logger(CartController.name);

  constructor(private cartService: CartService) {}

  /**
   * addToCart()
   *
   * @param addCartDto
   * @param user
   */
  @Post('/add-to-cart')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async addToCart(
    @Body()
    addCartDto: AddCartDto,
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.cartService.addToCart(addCartDto, user);
  }

  @Post('/add-to-cart-multiple')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async addToCartMultiple(
    @Body()
    addCartDto: AddCartDto[],
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.cartService.addToCartMultiple(addCartDto, user);
  }

  /**
   * getCartByUserId()
   *
   * @param user
   */
  @Version(VERSION_NEUTRAL)
  @Get('/get-carts-by-user')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async getCartByUserId(@GetTokenUser() user: User): Promise<ResponsePayload> {
    return this.cartService.getCartByUserId(user);
  }

  /**
   * deleteCartById()
   *
   * @param id
   * @param user
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async deleteCartById(
    @Param('id', MongoIdValidationPipe) id: string,
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.cartService.deleteCartById(id, user);
  }

  /**
   * updateCartDyId()
   *
   * @param id
   * @param updateCartDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async updateCartById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<ResponsePayload> {
    console.log('updateCartDto', updateCartDto);
    return await this.cartService.updateCartById(id, updateCartDto);
  }

  /**
   * updateCartDyId()
   *
   * @param id
   * @param updateCartQty
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update-qty/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async updateCartQty(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateCartQty: UpdateCartQty,
  ): Promise<ResponsePayload> {
    return await this.cartService.updateCartQty(id, updateCartQty);
  }
}
