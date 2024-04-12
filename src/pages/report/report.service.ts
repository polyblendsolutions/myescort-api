import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report } from 'src/interfaces/common/report.interface';

import { AddReportDto, FilterAndPaginationReportDto, UpdateReportDto } from '../../dto/report.dto';
import { ErrorCodes } from '../../enum/error-code.enum';
import { Admin } from '../../interfaces/admin/admin.interface';
import { Product } from '../../interfaces/common/product.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { UtilsService } from '../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class ReportService {
  private logger = new Logger(ReportService.name);

  constructor(
    @InjectModel('Report') private readonly reportModel: Model<Report>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addReport
   * insertManyReport
   *
   * @param user
   * @param addReportDto
   */
  async addReport(user: User, addReportDto: AddReportDto): Promise<ResponsePayload> {
    try {
      // const productData = await this.productModel
      //   .findById({ _id: addReportDto.product })
      //   .select('name slug images');

      // const userData = await this.userModel
      //   .findById({ _id: user._id })
      //   .select('name profileImg');

      // const mData = {
      //   ...addReportDto,
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
      console.log(addReportDto);
      const newData = new this.reportModel(addReportDto);
      await newData.save();

      // await this.productModel.findByIdAndUpdate(addReportDto.product, {
      //   $inc: {
      //     ratingCount: addReportDto.rating,
      //     ratingTotal: 1,
      //     reportTotal: 1,
      //   },
      // });

      return {
        success: true,
        message: 'report Added Successfully!',
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async addReportByAdmin(admin: Admin, addReportDto: AddReportDto): Promise<ResponsePayload> {
    try {
      // const productData = await this.productModel
      //   .findById({ _id: addReportDto.product })
      //   .select('name slug images');

      // const userData = await this.adminModel
      //   .findById({ _id: admin._id })
      //   .select('name profileImg');

      // const mData = {
      //   ...addReportDto,
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
      console.log(addReportDto);
      const newData = new this.reportModel(addReportDto);
      await newData.save();

      // await this.productModel.findByIdAndUpdate(addReportDto.product, {
      //   $inc: {
      //     ratingCount: addReportDto.rating,
      //     ratingTotal: 1,
      //     reportTotal: 1,
      //   },
      // });

      return {
        success: true,
        message: 'report Added Successfully!',
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * getAllReportsByQuery()
   * getAllReports()
   * getReportById()
   */

  async getAllReportsByQuery(
    filterReportDto: FilterAndPaginationReportDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterReportDto;
    const { pagination } = filterReportDto;
    const { sort } = filterReportDto;
    const { select } = filterReportDto;
    const { filterGroup } = filterReportDto;

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
              { report: { $regex: searchQuery, $options: 'i' } },
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
      const dataAggregates = await this.reportModel.aggregate(aggregateStages);
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

  async getAllReports(): Promise<ResponsePayload> {
    try {
      const reports = await this.reportModel
        .find()
        .populate('user', 'name phoneNo profileImg username')
        // .populate('product', 'name slug images _id')
        .sort({ createdAt: -1 });
      return {
        success: true,
        message: 'Success',
        data: reports,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getReportById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.reportModel.findById(id).select(select);

      // const reportId = req.params.reportId;
      // const report = await ReportControl.findOne({_id: reportId});

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
   * updateReportById
   * updateMultipleReportById
   *
   * @param id
   * @param updateReportDto
   */
  async updateReportById(id: string, updateReportDto: UpdateReportDto): Promise<ResponsePayload> {
    try {
      await this.reportModel.updateOne({ _id: id }, { $set: updateReportDto });
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
   * deleteReportById
   * deleteMultipleReportById
   *
   * @param id
   */
  async deleteReportById(id: string): Promise<ResponsePayload> {
    try {
      await this.reportModel.deleteOne({ _id: id });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleReportById(ids: string[], checkUsage: boolean): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.reportModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: ' Delete Data Successfull',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
