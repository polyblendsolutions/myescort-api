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

import { WishListService } from './wish-list.service';
import { GetTokenUser } from '../../decorator/get-token-user.decorator';
import { AddWishListDto, UpdateWishListDto, UpdateWishListQty } from '../../dto/wish-list.dto';
import { UserJwtAuthGuard } from '../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('wishList')
export class WishListController {
  private logger = new Logger(WishListController.name);

  constructor(private wishListService: WishListService) {}

  /**
   * addToWishList()
   *
   * @param addWishListDto
   * @param user
   */
  @Post('/add-to-wish-list')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async addToWishList(
    @Body()
    addWishListDto: AddWishListDto,
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.wishListService.addToWishList(addWishListDto, user);
  }

  @Post('/add-to-wish-list-multiple')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async addToWishListMultiple(
    @Body()
    addWishListDto: AddWishListDto[],
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.wishListService.addToWishListMultiple(addWishListDto, user);
  }

  /**
   * getWishListByUserId()
   *
   * @param user
   */
  @Version(VERSION_NEUTRAL)
  @Get('/get-wish-lists-by-user')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async getWishListByUserId(@GetTokenUser() user: User): Promise<ResponsePayload> {
    return this.wishListService.getWishListByUserId(user);
  }

  /**
   * deleteWishListById()
   *
   * @param id
   * @param user
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async deleteWishListById(
    @Param('id', MongoIdValidationPipe) id: string,
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.wishListService.deleteWishListById(id, user);
  }

  /**
   * updateWishListDyId()
   *
   * @param id
   * @param updateWishListDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async updateWishListById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateWishListDto: UpdateWishListDto,
  ): Promise<ResponsePayload> {
    console.log('updateWishListDto', updateWishListDto);
    return await this.wishListService.updateWishListById(id, updateWishListDto);
  }

  /**
   * updateWishListDyId()
   *
   * @param id
   * @param updateWishListQty
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update-qty/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async updateWishListQty(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateWishListQty: UpdateWishListQty,
  ): Promise<ResponsePayload> {
    return await this.wishListService.updateWishListQty(id, updateWishListQty);
  }
}
