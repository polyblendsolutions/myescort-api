import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from 'src/interfaces/common/cart.interface';

import { AddCartDto, UpdateCartDto, UpdateCartQty } from '../../dto/cart.dto';
import { Product } from '../../interfaces/common/product.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { UtilsService } from '../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class CartService {
  private logger = new Logger(CartService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<Cart>,
    @InjectModel('Cart') private readonly cartModel: Model<Cart>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addToCart()
   * addToCartMultiple()
   *
   * @param addCartDto
   * @param user
   */
  async addToCart(addCartDto: AddCartDto, user: User): Promise<ResponsePayload> {
    const userId = user._id;
    const data = addCartDto;
    const final = { ...data, ...{ user: userId } };

    try {
      const cartData = await this.cartModel.findOne({
        user: userId,
        product: addCartDto.product,
      });
      if (cartData) {
        await this.cartModel.findByIdAndUpdate(cartData._id, {
          $inc: { selectedQty: addCartDto.selectedQty },
        });
        return {
          success: true,
          message: 'Cart Item Updated Successfully!',
        } as ResponsePayload;
      } else {
        const newData = new this.cartModel(final);
        const saveData = await newData.save();

        await this.userModel.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              carts: saveData._id,
            },
          },
        );

        return {
          success: true,
          message: 'Added to Cart Successfully!',
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async addToCartMultiple(addCartDto: AddCartDto[], user: User): Promise<ResponsePayload> {
    const userId = user._id;

    try {
      for (const data of addCartDto) {
        const cartData = await this.cartModel.findOne({
          user: userId,
          product: data.product,
        });

        if (cartData) {
          await this.cartModel.findByIdAndUpdate(cartData._id, {
            $inc: { selectedQty: data.selectedQty },
          });
        } else {
          const final = { ...data, ...{ user: userId } };
          const newData = new this.cartModel(final);
          const saveData = await newData.save();

          await this.userModel.findOneAndUpdate(
            { _id: userId },
            {
              $push: {
                carts: saveData._id,
              },
            },
          );
        }
      }
      return {
        success: true,
        message: 'Multiple Added to Cart Successfully!',
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * getCartByUserId()
   *
   * @param user
   */
  async getCartByUserId(user: User): Promise<ResponsePayload> {
    try {
      const data = await this.cartModel
        .find({ user: user._id })
        .populate(
          'product',
          'name slug description salePrice sku tax discountType discountAmount images quantity trackQuantity category subCategory brand tags unit',
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
   * deleteCartById()
   *
   * @param id
   * @param user
   */
  async deleteCartById(id: string, user: User): Promise<ResponsePayload> {
    try {
      await this.cartModel.findByIdAndDelete(id);

      await this.userModel.findByIdAndUpdate(user._id, {
        $pull: { carts: { $in: id } },
      });

      return {
        success: true,
        message: 'Item Removed Successfully From Cart!',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateCartDyId()
   *
   * @param id
   * @param updateCartDto
   */
  async updateCartById(id: string, updateCartDto: UpdateCartDto): Promise<ResponsePayload> {
    try {
      console.log('updateCartDto', updateCartDto);
      await this.cartModel.findByIdAndUpdate(id, {
        $set: updateCartDto,
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
   * updateCartQty()
   *
   * @param id
   * @param updateCartQty
   */
  async updateCartQty(id: string, updateCartQty: UpdateCartQty): Promise<ResponsePayload> {
    console.log('updateCartQty', updateCartQty);
    console.log('id', id);
    try {
      const data = await this.cartModel.findById(id).populate('product', 'quantity trackQuantity name cartLimit');

      if (updateCartQty.type == 'increment') {
        if (data.product.cartLimit > 0) {
          if (data.selectedQty < data.product.cartLimit) {
            if (data.product.trackQuantity == true) {
              if (data.selectedQty >= data.product.quantity) {
                return {
                  success: true,
                  message: 'Product quantity is not available',
                  type: 'not available',
                } as ResponsePayload;
              } else {
                await this.cartModel.findByIdAndUpdate(id, {
                  $inc: {
                    selectedQty: updateCartQty.selectedQty,
                  },
                });
              }
            } else {
              await this.cartModel.findByIdAndUpdate(id, {
                $inc: {
                  selectedQty: updateCartQty.selectedQty,
                },
              });
            }
          } else {
            return {
              success: true,
              message: `Can not order more than ${data.product.cartLimit}`,
              type: 'not available',
            } as ResponsePayload;
          }
        } else {
          if (data.product.trackQuantity == true) {
            if (data.selectedQty >= data.product.quantity) {
              return {
                success: true,
                message: 'Product quantity is not available',
                type: 'not available',
              } as ResponsePayload;
            } else {
              await this.cartModel.findByIdAndUpdate(id, {
                $inc: {
                  selectedQty: updateCartQty.selectedQty,
                },
              });
            }
          } else {
            await this.cartModel.findByIdAndUpdate(id, {
              $inc: {
                selectedQty: updateCartQty.selectedQty,
              },
            });
          }
        }
      }

      if (updateCartQty.type == 'decrement') {
        await this.cartModel.findByIdAndUpdate(id, {
          $inc: {
            selectedQty: -updateCartQty.selectedQty,
          },
        });
      }

      return {
        success: true,
        message: 'Quantity Updated Successfully!',
        type: 'available',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
