import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AddWishListDto, UpdateWishListDto, UpdateWishListQty } from '../../dto/wish-list.dto';
import { Product } from '../../interfaces/common/product.interface';
import { WishList } from '../../interfaces/common/wish-list.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { UtilsService } from '../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class WishListService {
  private logger = new Logger(WishListService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<WishList>,
    @InjectModel('WishList') private readonly wishListModel: Model<WishList>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addToWishList()
   * addToWishListMultiple()
   *
   * @param addWishListDto
   * @param user
   */
  async addToWishList(addWishListDto: AddWishListDto, user: User): Promise<ResponsePayload> {
    const userId = user._id;
    const data = addWishListDto;
    const final = { ...data, ...{ user: userId } };

    try {
      const wishListData = await this.wishListModel.findOne({
        user: userId,
        product: addWishListDto.product,
      });
      if (wishListData) {
        await this.wishListModel.findByIdAndUpdate(wishListData._id, {
          $inc: { selectedQty: addWishListDto.selectedQty },
        });
        return {
          success: true,
          message: 'Varen er blevet opdateret i favoritterne med succes!',
        } as ResponsePayload;
      } else {
        const newData = new this.wishListModel(final);
        const saveData = await newData.save();

        await this.userModel.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              wishLists: saveData._id,
            },
          },
        );

        return {
          success: true,
          message: 'Varen er blevet tilføjet til favoritterne med succes!',
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async addToWishListMultiple(addWishListDto: AddWishListDto[], user: User): Promise<ResponsePayload> {
    const userId = user._id;

    try {
      for (const data of addWishListDto) {
        const wishListData = await this.wishListModel.findOne({
          user: userId,
          product: data.product,
        });

        if (wishListData) {
          await this.wishListModel.findByIdAndUpdate(wishListData._id, {
            $inc: { selectedQty: data.selectedQty },
          });
        } else {
          const final = { ...data, ...{ user: userId } };
          const newData = new this.wishListModel(final);
          const saveData = await newData.save();

          await this.userModel.findOneAndUpdate(
            { _id: userId },
            {
              $push: {
                wishLists: saveData._id,
              },
            },
          );
        }
      }
      return {
        success: true,
        message: 'Mange tilføjet til favoritterne med succes!',
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * getWishListByUserId()
   *
   * @param user
   */
  async getWishListByUserId(user: User): Promise<ResponsePayload> {
    try {
      const data = await this.wishListModel
        .find({ user: user._id })
        .populate(
          'product',
          'name address status slug description salePrice sku tax discountType discountAmount images quantity category age division subCategory brand tags user',
        );

      return {
        data: data,
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * deleteWishListById()
   *
   * @param id
   * @param user
   */
  async deleteWishListById(id: string, user: User): Promise<ResponsePayload> {
    try {
      await this.wishListModel.findByIdAndDelete(id);

      await this.userModel.findByIdAndUpdate(user._id, {
        $pull: { wishLists: { $in: id } },
      });

      return {
        success: true,
        message: 'Varen er blevet fjernet fra dine favoritter med succes!',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateWishListDyId()
   *
   * @param id
   * @param updateWishListDto
   */
  async updateWishListById(id: string, updateWishListDto: UpdateWishListDto): Promise<ResponsePayload> {
    try {
      console.log('updateWishListDto', updateWishListDto);
      await this.wishListModel.findByIdAndUpdate(id, {
        $set: updateWishListDto,
      });

      return {
        success: true,
        message: 'Item Updated Successfully!',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateWishListQty()
   *
   * @param id
   * @param updateWishListQty
   */
  async updateWishListQty(id: string, updateWishListQty: UpdateWishListQty): Promise<ResponsePayload> {
    try {
      if (updateWishListQty.type == 'increment') {
        await this.wishListModel.findByIdAndUpdate(id, {
          $inc: {
            selectedQty: updateWishListQty.selectedQty,
          },
        });
      }

      if (updateWishListQty.type == 'decrement') {
        await this.wishListModel.findByIdAndUpdate(id, {
          $inc: {
            selectedQty: -updateWishListQty.selectedQty,
          },
        });
      }

      return {
        success: true,
        message: 'Quantity Updated Successfully!',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
