import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AddOrientationDto,
  FilterAndPaginationOrientationDto,
  OptionOrientationDto,
  UpdateOrientationDto,
} from '../../../dto/orientation.dto';
import { ErrorCodes } from '../../../enum/error-code.enum';
import { Orientation } from '../../../interfaces/common/orientation.interface';
import { Product } from '../../../interfaces/common/product.interface';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { UtilsService } from '../../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class OrientationService {
  private logger = new Logger(OrientationService.name);

  constructor(
    @InjectModel('Orientation')
    private readonly orientationModel: Model<Orientation>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addOrientation
   * insertManyOrientation
   *
   * @param addOrientationDto
   */
  async addOrientation(addOrientationDto: AddOrientationDto): Promise<ResponsePayload> {
    const { name, slug } = addOrientationDto;

    try {
      let finalSlug;
      const fData = await this.orientationModel.findOne({ slug: slug });

      if (fData) {
        finalSlug = this.utilsService.transformToSlug(slug, true);
      } else {
        finalSlug = slug;
      }

      const defaultData = {
        slug: finalSlug,
      };
      const mData = { ...addOrientationDto, ...defaultData };
      const newData = new this.orientationModel(mData);

      const saveData = await newData.save();
      const data = {
        _id: saveData._id,
      };
      return {
        success: true,
        message: 'Data Added Successfully',
        data,
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async insertManyOrientation(
    addOrientationsDto: AddOrientationDto[],
    optionOrientationDto: OptionOrientationDto,
  ): Promise<ResponsePayload> {
    const { deleteMany } = optionOrientationDto;
    if (deleteMany) {
      await this.orientationModel.deleteMany({});
    }
    const mData = addOrientationsDto.map((m) => {
      return {
        ...m,
        ...{
          slug: this.utilsService.transformToSlug(m.name),
        },
      };
    });
    try {
      const saveData = await this.orientationModel.insertMany(mData);
      return {
        success: true,
        message: `${saveData && saveData.length ? saveData.length : 0}  Data Added Success`,
      } as ResponsePayload;
    } catch (error) {
      // console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  /**
   * getAllOrientations
   * getOrientationById
   */
  async getAllOrientationsBasic() {
    try {
      const pageSize = 10;
      const currentPage = 3;
      const data = await this.orientationModel
        .find()
        .skip(pageSize * (currentPage - 1))
        .limit(Number(pageSize));
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getAllOrientations(
    filterOrientationDto: FilterAndPaginationOrientationDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterOrientationDto;
    const { pagination } = filterOrientationDto;
    const { sort } = filterOrientationDto;
    const { select } = filterOrientationDto;

    // Essential Variables
    const aggregateSorientationes = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };
    }
    if (searchQuery) {
      mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
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
      aggregateSorientationes.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateSorientationes.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateSorientationes.push({ $project: mSelect });
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

      aggregateSorientationes.push(mPagination);

      aggregateSorientationes.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.orientationModel.aggregate(aggregateSorientationes);
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
        throw new InternalServerErrorException(err.message);
      }
    }
  }

  async getOrientationById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.orientationModel.findById(id).select(select);
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
   * updateOrientationById
   * updateMultipleOrientationById
   *
   * @param id
   * @param updateOrientationDto
   */
  async updateOrientationById(id: string, updateOrientationDto: UpdateOrientationDto): Promise<ResponsePayload> {
    try {
      const { name, slug } = updateOrientationDto;

      let finalSlug;
      const fData = await this.orientationModel.findById(id);

      // Check Slug
      if (fData.slug !== slug) {
        const fData = await this.orientationModel.findOne({ slug: slug });
        if (fData) {
          finalSlug = this.utilsService.transformToSlug(slug, true);
        } else {
          finalSlug = slug;
        }
      } else {
        finalSlug = slug;
      }

      const defaultData = {
        slug: finalSlug,
      };

      const finalData = { ...updateOrientationDto, ...defaultData };

      await this.orientationModel.findByIdAndUpdate(id, {
        $set: finalData,
      });
      return {
        success: true,
        message: 'Update Successfully',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleOrientationById(
    ids: string[],
    updateOrientationDto: UpdateOrientationDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    // Delete No Multiple Action Data
    if (updateOrientationDto.slug) {
      delete updateOrientationDto.slug;
    }

    try {
      await this.orientationModel.updateMany({ _id: { $in: mIds } }, { $set: updateOrientationDto });

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * deleteOrientationById
   * deleteMultipleOrientationById
   *
   * @param id
   * @param checkUsage
   */
  async deleteOrientationById(id: string, checkUsage: boolean): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.orientationModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      await this.orientationModel.findByIdAndDelete(id);
      // Reset Product Orientation Reference
      if (checkUsage) {
        // Update Product
        await this.productModel.updateMany(
          {},
          {
            $pull: { orientations: new ObjectId(id) },
          },
        );
      }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleOrientationById(ids: string[], checkUsage: boolean): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.orientationModel.deleteMany({ _id: ids });
      // Reset Product Brand Reference
      if (checkUsage) {
        // Update Product
        await this.productModel.updateMany({}, { $pull: { orientations: { $in: mIds } } });
      }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
