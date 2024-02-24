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
  AddVerifiedDto,
  FilterAndPaginationVerifiedDto,
  UpdateVerifiedDto,
} from '../../dto/verified.dto';
import { Verified } from 'src/interfaces/common/verified.interface';
import { User } from '../../interfaces/user/user.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class VerifiedService {
  private logger = new Logger(VerifiedService.name);

  constructor(
    @InjectModel('Verified') private readonly verifiedModel: Model<Verified>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addVerified
   * insertManyVerified
   */
  async addVerified(
    user: User,
    addVerifiedDto: AddVerifiedDto,
  ): Promise<ResponsePayload> {
    try {
      // const productData = await this.productModel
      //   .findById({ _id: addVerifiedDto.product })
      //   .select('name slug images');

      // const userData = await this.userModel
      //   .findById({ _id: user._id })
      //   .select('name profileImg');

      // const mData = {
      //   ...addVerifiedDto,
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
      console.log(addVerifiedDto);
      const newData = new this.verifiedModel(addVerifiedDto);
      await newData.save();

      // await this.productModel.findByIdAndUpdate(addVerifiedDto.product, {
      //   $inc: {
      //     ratingCount: addVerifiedDto.rating,
      //     ratingTotal: 1,
      //     verifiedTotal: 1,
      //   },
      // });

      return {
        success: true,
        message: 'verified Added Successfully!',
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async addVerifiedByAdmin(
    admin: Admin,
    addVerifiedDto: AddVerifiedDto,
  ): Promise<ResponsePayload> {
    try {
      // const productData = await this.productModel
      //   .findById({ _id: addVerifiedDto.product })
      //   .select('name slug images');

      // const userData = await this.adminModel
      //   .findById({ _id: admin._id })
      //   .select('name profileImg');

      // const mData = {
      //   ...addVerifiedDto,
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
      console.log(addVerifiedDto);
      const newData = new this.verifiedModel(addVerifiedDto);
      await newData.save();

      // await this.productModel.findByIdAndUpdate(addVerifiedDto.product, {
      //   $inc: {
      //     ratingCount: addVerifiedDto.rating,
      //     ratingTotal: 1,
      //     verifiedTotal: 1,
      //   },
      // });

      return {
        success: true,
        message: 'verified Added Successfully!',
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * getAllVerifiedsByQuery()
   * getAllVerifieds()
   * getVerifiedById()
   */

  async getAllVerifiedsByQuery(
    filterVerifiedDto: FilterAndPaginationVerifiedDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterVerifiedDto;
    const { pagination } = filterVerifiedDto;
    const { sort } = filterVerifiedDto;
    const { select } = filterVerifiedDto;
    const { filterGroup } = filterVerifiedDto;

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
              { verified: { $regex: searchQuery, $options: 'i' } },
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
      const dataAggregates = await this.verifiedModel.aggregate(
        aggregateStages,
      );
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

  async getAllVerifieds(): Promise<ResponsePayload> {
    try {
      const verifieds = await this.verifiedModel
        .find()
        .populate('user', 'name phoneNo profileImg username')
        .populate('product', 'name slug images ')
        .sort({ createdAt: -1 });
      return {
        success: true,
        message: 'Success',
        data: verifieds,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getVerifiedById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.verifiedModel.findById(id).select(select);

      // const verifiedId = req.params.verifiedId;
      // const verified = await VerifiedControl.findOne({_id: verifiedId});

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
   * updateVerifiedById
   * updateMultipleVerifiedById
   */
  async updateVerifiedById(
    id: string,
    updateVerifiedDto: UpdateVerifiedDto,
  ): Promise<ResponsePayload> {
    try {
      await this.verifiedModel.updateOne(
        { _id: id },
        { $set: updateVerifiedDto },
      );
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
   * deleteVerifiedById
   * deleteMultipleVerifiedById
   */
  async deleteVerifiedById(id: string): Promise<ResponsePayload> {
    try {
      await this.verifiedModel.deleteOne({ _id: id });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleVerifiedById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.verifiedModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: ' Delete Data Successfull',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
