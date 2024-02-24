import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {ConfigService} from '@nestjs/config';
import {UtilsService} from '../../../shared/utils/utils.service';
import {BodyType} from '../../../interfaces/common/bodyType.interface';
import {ResponsePayload} from '../../../interfaces/core/response-payload.interface';
import {ErrorCodes} from '../../../enum/error-code.enum';
import {
    AddBodyTypeDto,
    FilterAndPaginationBodyTypeDto,
    OptionBodyTypeDto,
    UpdateBodyTypeDto,
} from '../../../dto/body-type.dto';
import {Product} from '../../../interfaces/common/product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class BodyTypeService {
    private logger = new Logger(BodyTypeService.name);

    constructor(
        @InjectModel('BodyType') private readonly bodyTypeModel: Model<BodyType>,
        @InjectModel('Product') private readonly productModel: Model<Product>,
        private configService: ConfigService,
        private utilsService: UtilsService,
    ) {
    }

    /**
     * addBodyType
     * insertManyBodyType
     */
    async addBodyType(addBodyTypeDto: AddBodyTypeDto): Promise<ResponsePayload> {
        const {name, slug} = addBodyTypeDto;

        try {
            let finalSlug;
            const fData = await this.bodyTypeModel.findOne({slug: slug});

            if (fData) {
                finalSlug = this.utilsService.transformToSlug(slug, true);
            } else {
                finalSlug = slug;
            }

            const defaultData = {
                slug: finalSlug,
            };
            const mData = {...addBodyTypeDto, ...defaultData};
            const newData = new this.bodyTypeModel(mData);

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

    async insertManyBodyType(
        addBodyTypesDto: AddBodyTypeDto[],
        optionBodyTypeDto: OptionBodyTypeDto,
    ): Promise<ResponsePayload> {
        const {deleteMany} = optionBodyTypeDto;
        if (deleteMany) {
            await this.bodyTypeModel.deleteMany({});
        }
        const mData = addBodyTypesDto.map((m) => {
            return {
                ...m,
                ...{
                    slug: this.utilsService.transformToSlug(m.name),
                },
            };
        });
        try {
            const saveData = await this.bodyTypeModel.insertMany(mData);
            return {
                success: true,
                message: `${
                    saveData && saveData.length ? saveData.length : 0
                }  Data Added Success`,
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
     * getAllBodyTypes
     * getBodyTypeById
     */
    async getAllBodyTypesBasic() {
        try {
            const pageSize = 10;
            const currentPage = 3;
            const data = await this.bodyTypeModel
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

    async getAllBodyTypes(
        filterBodyTypeDto: FilterAndPaginationBodyTypeDto,
        searchQuery?: string,
    ): Promise<ResponsePayload> {
        const {filter} = filterBodyTypeDto;
        const {pagination} = filterBodyTypeDto;
        const {sort} = filterBodyTypeDto;
        const {select} = filterBodyTypeDto;

        // Essential Variables
        const aggregateSbodyTypees = [];
        let mFilter = {};
        let mSort = {};
        let mSelect = {};
        let mPagination = {};

        // Match
        if (filter) {
            mFilter = {...mFilter, ...filter};
        }
        if (searchQuery) {
            mFilter = {...mFilter, ...{name: new RegExp(searchQuery, 'i')}};
        }
        // Sort
        if (sort) {
            mSort = sort;
        } else {
            mSort = {createdAt: -1};
        }

        // Select
        if (select) {
            mSelect = {...select};
        } else {
            mSelect = {name: 1};
        }

        // Finalize
        if (Object.keys(mFilter).length) {
            aggregateSbodyTypees.push({$match: mFilter});
        }

        if (Object.keys(mSort).length) {
            aggregateSbodyTypees.push({$sort: mSort});
        }

        if (!pagination) {
            aggregateSbodyTypees.push({$project: mSelect});
        }

        // Pagination
        if (pagination) {
            if (Object.keys(mSelect).length) {
                mPagination = {
                    $facet: {
                        metadata: [{$count: 'total'}],
                        data: [
                            {
                                $skip: pagination.pageSize * pagination.currentPage,
                            } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
                            {$limit: pagination.pageSize},
                            {$project: mSelect},
                        ],
                    },
                };
            } else {
                mPagination = {
                    $facet: {
                        metadata: [{$count: 'total'}],
                        data: [
                            {
                                $skip: pagination.pageSize * pagination.currentPage,
                            } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
                            {$limit: pagination.pageSize},
                        ],
                    },
                };
            }

            aggregateSbodyTypees.push(mPagination);

            aggregateSbodyTypees.push({
                $project: {
                    data: 1,
                    count: {$arrayElemAt: ['$metadata.total', 0]},
                },
            });
        }

        try {
            const dataAggregates = await this.bodyTypeModel.aggregate(aggregateSbodyTypees);
            if (pagination) {
                return {
                    ...{...dataAggregates[0]},
                    ...{success: true, message: 'Success'},
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

    async getBodyTypeById(id: string, select: string): Promise<ResponsePayload> {
        try {
            const data = await this.bodyTypeModel.findById(id).select(select);
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
     * updateBodyTypeById
     * updateMultipleBodyTypeById
     */
    async updateBodyTypeById(
        id: string,
        updateBodyTypeDto: UpdateBodyTypeDto,
    ): Promise<ResponsePayload> {
        try {
            const {name, slug} = updateBodyTypeDto;

            let finalSlug;
            const fData = await this.bodyTypeModel.findById(id);

            // Check Slug
            if (fData.slug !== slug) {
                const fData = await this.bodyTypeModel.findOne({slug: slug});
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

            const finalData = {...updateBodyTypeDto, ...defaultData};

            await this.bodyTypeModel.findByIdAndUpdate(id, {
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

    async updateMultipleBodyTypeById(
        ids: string[],
        updateBodyTypeDto: UpdateBodyTypeDto,
    ): Promise<ResponsePayload> {
        const mIds = ids.map((m) => new ObjectId(m));

        // Delete No Multiple Action Data
        if (updateBodyTypeDto.slug) {
            delete updateBodyTypeDto.slug;
        }

        try {
            await this.bodyTypeModel.updateMany(
                {_id: {$in: mIds}},
                {$set: updateBodyTypeDto},
            );

            return {
                success: true,
                message: 'Success',
            } as ResponsePayload;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    /**
     * deleteBodyTypeById
     * deleteMultipleBodyTypeById
     */
    async deleteBodyTypeById(
        id: string,
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        let data;
        try {
            data = await this.bodyTypeModel.findById(id);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
        if (!data) {
            throw new NotFoundException('No Data found!');
        }
        try {
            await this.bodyTypeModel.findByIdAndDelete(id);
            // Reset Product BodyType Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {
                        $pull: {bodyTypes: new ObjectId(id)},
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

    async deleteMultipleBodyTypeById(
        ids: string[],
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        try {
            const mIds = ids.map((m) => new ObjectId(m));
            await this.bodyTypeModel.deleteMany({_id: ids});
            // Reset Product Brand Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {$pull: {bodyTypes: {$in: mIds}}},
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
}
