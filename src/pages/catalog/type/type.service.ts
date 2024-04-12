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

import { AddTypeDto, FilterAndPaginationTypeDto, OptionTypeDto, UpdateTypeDto } from '../../../dto/type.dto';
import { ErrorCodes } from '../../../enum/error-code.enum';
import { Product } from '../../../interfaces/common/product.interface';
import { Type } from '../../../interfaces/common/type.interface';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { UtilsService } from '../../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class TypeService {
  private logger = new Logger(TypeService.name);

  constructor(
    @InjectModel('Type') private readonly typeModel: Model<Type>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * addType
   * insertManyType
   *
   * @param addTypeDto
   */
  async addType(addTypeDto: AddTypeDto): Promise<ResponsePayload> {
    const { name, slug } = addTypeDto;

    try {
      let finalSlug;
      const fData = await this.typeModel.findOne({ slug: slug });

      if (fData) {
        finalSlug = this.utilsService.transformToSlug(slug, true);
      } else {
        finalSlug = slug;
      }

      const defaultData = {
        slug: finalSlug,
      };
      const mData = { ...addTypeDto, ...defaultData };
      const newData = new this.typeModel(mData);

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

  async insertManyType(addTypesDto: AddTypeDto[], optionTypeDto: OptionTypeDto): Promise<ResponsePayload> {
    const { deleteMany } = optionTypeDto;
    if (deleteMany) {
      await this.typeModel.deleteMany({});
    }
    const mData = addTypesDto.map((m) => {
      return {
        ...m,
        ...{
          slug: this.utilsService.transformToSlug(m.name),
        },
      };
    });
    try {
      const saveData = await this.typeModel.insertMany(mData);
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
   * getAllTypes
   * getTypeById
   */
  async getAllTypesBasic() {
    try {
      const pageSize = 10;
      const currentPage = 3;
      const data = await this.typeModel
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

  async getAllTypes(filterTypeDto: FilterAndPaginationTypeDto, searchQuery?: string): Promise<ResponsePayload> {
    const { filter } = filterTypeDto;
    const { pagination } = filterTypeDto;
    const { sort } = filterTypeDto;
    const { select } = filterTypeDto;

    // Essential Variables
    const aggregateStypees = [];
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
      aggregateStypees.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateStypees.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateStypees.push({ $project: mSelect });
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

      aggregateStypees.push(mPagination);

      aggregateStypees.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.typeModel.aggregate(aggregateStypees);
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

  async getTypeById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.typeModel.findById(id).select(select);
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
   * updateTypeById
   * updateMultipleTypeById
   *
   * @param id
   * @param updateTypeDto
   */
  async updateTypeById(id: string, updateTypeDto: UpdateTypeDto): Promise<ResponsePayload> {
    try {
      const { name, slug } = updateTypeDto;

      let finalSlug;
      const fData = await this.typeModel.findById(id);

      // Check Slug
      if (fData.slug !== slug) {
        const fData = await this.typeModel.findOne({ slug: slug });
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

      const finalData = { ...updateTypeDto, ...defaultData };

      await this.typeModel.findByIdAndUpdate(id, {
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

  async updateMultipleTypeById(ids: string[], updateTypeDto: UpdateTypeDto): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    // Delete No Multiple Action Data
    if (updateTypeDto.slug) {
      delete updateTypeDto.slug;
    }

    try {
      await this.typeModel.updateMany({ _id: { $in: mIds } }, { $set: updateTypeDto });

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * deleteTypeById
   * deleteMultipleTypeById
   *
   * @param id
   * @param checkUsage
   */
  async deleteTypeById(id: string, checkUsage: boolean): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.typeModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      await this.typeModel.findByIdAndDelete(id);
      // Reset Product Type Reference
      if (checkUsage) {
        // Update Product
        await this.productModel.updateMany(
          {},
          {
            $pull: { types: new ObjectId(id) },
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

  async deleteMultipleTypeById(ids: string[], checkUsage: boolean): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.typeModel.deleteMany({ _id: ids });
      // Reset Product Brand Reference
      if (checkUsage) {
        // Update Product
        await this.productModel.updateMany({}, { $pull: { types: { $in: mIds } } });
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
