import { Admin } from './../../interfaces/admin/admin.interface';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../enum/error-code.enum';
import {
  AddReviewDto,
  FilterAndPaginationReviewDto,
  UpdateReviewDto,
} from '../../dto/review.dto';
import { Product } from '../../interfaces/common/product.interface';
import { Review } from 'src/interfaces/common/review.interface';
import { User } from '../../interfaces/user/user.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ReviewService {
  private logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel('Review') private readonly reviewModel: Model<Review>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addReview
   * insertManyReview
   */
  async addReview(
    user: User,
    addReviewDto: AddReviewDto,
  ): Promise<ResponsePayload> {
    try {
      // const productData = await this.productModel
      //   .findById({ _id: addReviewDto.product })
      //   .select('name slug images');

      // const userData = await this.userModel
      //   .findById({ _id: user._id })
      //   .select('name profileImg');

      // const mData = {
      //   ...addReviewDto,
      //   ...{
      //     product: {
      //       _id: productData._id,
      //       name: productData.name,
      //       images: productData.images,
      //       slug: productData.slug,
      //     },
      //     user: {
      //       _id: userData._id,
      //       name: userData.name,
      //       profileImg: userData.profileImg,
      //     },
      //   },
      // };
      console.log(addReviewDto);
      const newData = new this.reviewModel(addReviewDto);
      await newData.save();

      // await this.productModel.findByIdAndUpdate(addReviewDto.product, {
      //   $inc: {
      //     ratingCount: addReviewDto.rating,
      //     ratingTotal: 1,
      //     reviewTotal: 1,
      //   },
      // });

      return {
        success: true,
        message: 'review Added Successfully!',
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async addReviewByAdmin(
    admin: Admin,
    addReviewDto: AddReviewDto,
  ): Promise<ResponsePayload> {
    try {
      // const productData = await this.productModel
      //   .findById({ _id: addReviewDto.product })
      //   .select('name slug images');

      // const userData = await this.adminModel
      //   .findById({ _id: admin._id })
      //   .select('name profileImg');

      // const mData = {
      //   ...addReviewDto,
      //   ...{
      //     product: {
      //       _id: productData._id,
      //       name: productData.name,
      //       images: productData.images,
      //       slug: productData.slug,
      //     },
      //     user: {
      //       _id: userData._id,
      //       name: userData.name,
      //       profileImg: userData.profileImg,
      //     },
      //   },
      // };
      console.log(addReviewDto);
      const newData = new this.reviewModel(addReviewDto);
      await newData.save();

      // await this.productModel.findByIdAndUpdate(addReviewDto.product, {
      //   $inc: {
      //     ratingCount: addReviewDto.rating,
      //     ratingTotal: 1,
      //     reviewTotal: 1,
      //   },
      // });

      return {
        success: true,
        message: 'review Added Successfully!',
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * getAllReviewsByQuery()
   * getAllReviews()
   * getReviewById()
   */

  async getAllReviewsByQuery(
    filterReviewDto: FilterAndPaginationReviewDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterReviewDto;
    const { pagination } = filterReviewDto;
    const { sort } = filterReviewDto;
    const { select } = filterReviewDto;
    const { filterGroup } = filterReviewDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match

    if (filter) {
      if (filter['product._id']) {
        filter['product._id'] = new ObjectId(filter['product._id']);
      }
      mFilter = { ...mFilter, ...filter };
    }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { review: { $regex: searchQuery, $options: 'i' } },
              { rating: { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
      };
    }
    // Sort
    if (sort) {
      mSort = sort;
    } else {
      mSort = { createdAt: -1 };
    }

    // Select
    if (select) {
      mSelect = { ...select };
    } else {
      mSelect = { name: 1 };
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      aggregateStages.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateStages.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateStages.push({ $project: mSelect });
    }

    // Pagination
    if (pagination) {
      if (Object.keys(mSelect).length) {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
              { $project: mSelect },
            ],
          },
        };
      } else {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
            ],
          },
        };
      }

      aggregateStages.push(mPagination);

      aggregateStages.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.reviewModel.aggregate(aggregateStages);
      // .populate('user', 'fullName profileImg username')
      //     .populate('product', 'productName productSlug images categorySlug')
      //     .sort({createdAt: -1})

      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{ success: true, message: 'Success' },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
        } as ResponsePayload;
      }
    } catch (err) {
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getAllReviews(): Promise<ResponsePayload> {
    try {
      const reviews = await this.reviewModel
        .find()
        .populate('user', 'name phoneNo profileImg username')
        .populate('product', 'name slug images ')
        .sort({ createdAt: -1 });
      return {
        success: true,
        message: 'Success',
        data: reviews,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getReviewById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.reviewModel.findById(id).select(select);

      // const reviewId = req.params.reviewId;
      // const review = await ReviewControl.findOne({_id: reviewId});

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateReviewById
   * updateMultipleReviewById
   */
  async updateReviewById(
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ResponsePayload> {
    try {
      await this.reviewModel.updateOne({ _id: id }, { $set: updateReviewDto });
      return {
        success: true,
        message: 'Update Successfull',
      } as ResponsePayload;
    } catch (err) {
      console.log('errrarasekj>>', err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * deleteReviewById
   * deleteMultipleReviewById
   */
  async deleteReviewById(id: string): Promise<ResponsePayload> {
    try {
      await this.reviewModel.deleteOne({ _id: id });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

   

  async deleteMultipleReviewById( 
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.reviewModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: ' Delete Data Successfull',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

}
