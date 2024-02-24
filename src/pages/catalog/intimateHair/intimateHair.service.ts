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
import {IntimateHair} from '../../../interfaces/common/intimateHair.interface';
import {ResponsePayload} from '../../../interfaces/core/response-payload.interface';
import {ErrorCodes} from '../../../enum/error-code.enum';
import {
    AddIntimateHairDto,
    FilterAndPaginationIntimateHairDto,
    OptionIntimateHairDto,
    UpdateIntimateHairDto,
} from '../../../dto/intimateHair.dto';
import {Product} from '../../../interfaces/common/product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class IntimateHairService {
    private logger = new Logger(IntimateHairService.name);

    constructor(
        @InjectModel('IntimateHair') private readonly intimateHairModel: Model<IntimateHair>,
        @InjectModel('Product') private readonly productModel: Model<Product>,
        private configService: ConfigService,
        private utilsService: UtilsService,
    ) {
    }

    /**
     * addIntimateHair
     * insertManyIntimateHair
     */
    async addIntimateHair(addIntimateHairDto: AddIntimateHairDto): Promise<ResponsePayload> {
        const {name, slug} = addIntimateHairDto;

        try {
            let finalSlug;
            const fData = await this.intimateHairModel.findOne({slug: slug});

            if (fData) {
                finalSlug = this.utilsService.transformToSlug(slug, true);
            } else {
                finalSlug = slug;
            }

            const defaultData = {
                slug: finalSlug,
            };
            const mData = {...addIntimateHairDto, ...defaultData};
            const newData = new this.intimateHairModel(mData);

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

    async insertManyIntimateHair(
        addIntimateHairsDto: AddIntimateHairDto[],
        optionIntimateHairDto: OptionIntimateHairDto,
    ): Promise<ResponsePayload> {
        const {deleteMany} = optionIntimateHairDto;
        if (deleteMany) {
            await this.intimateHairModel.deleteMany({});
        }
        const mData = addIntimateHairsDto.map((m) => {
            return {
                ...m,
                ...{
                    slug: this.utilsService.transformToSlug(m.name),
                },
            };
        });
        try {
            const saveData = await this.intimateHairModel.insertMany(mData);
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
     * getAllIntimateHairs
     * getIntimateHairById
     */
    async getAllIntimateHairsBasic() {
        try {
            const pageSize = 10;
            const currentPage = 3;
            const data = await this.intimateHairModel
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

    async getAllIntimateHairs(
        filterIntimateHairDto: FilterAndPaginationIntimateHairDto,
        searchQuery?: string,
    ): Promise<ResponsePayload> {
        const {filter} = filterIntimateHairDto;
        const {pagination} = filterIntimateHairDto;
        const {sort} = filterIntimateHairDto;
        const {select} = filterIntimateHairDto;

        // Essential Variables
        const aggregateSintimateHaires = [];
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
            aggregateSintimateHaires.push({$match: mFilter});
        }

        if (Object.keys(mSort).length) {
            aggregateSintimateHaires.push({$sort: mSort});
        }

        if (!pagination) {
            aggregateSintimateHaires.push({$project: mSelect});
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

            aggregateSintimateHaires.push(mPagination);

            aggregateSintimateHaires.push({
                $project: {
                    data: 1,
                    count: {$arrayElemAt: ['$metadata.total', 0]},
                },
            });
        }

        try {
            const dataAggregates = await this.intimateHairModel.aggregate(aggregateSintimateHaires);
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

    async getIntimateHairById(id: string, select: string): Promise<ResponsePayload> {
        try {
            const data = await this.intimateHairModel.findById(id).select(select);
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
     * updateIntimateHairById
     * updateMultipleIntimateHairById
     */
    async updateIntimateHairById(
        id: string,
        updateIntimateHairDto: UpdateIntimateHairDto,
    ): Promise<ResponsePayload> {
        try {
            const {name, slug} = updateIntimateHairDto;

            let finalSlug;
            const fData = await this.intimateHairModel.findById(id);

            // Check Slug
            if (fData.slug !== slug) {
                const fData = await this.intimateHairModel.findOne({slug: slug});
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

            const finalData = {...updateIntimateHairDto, ...defaultData};

            await this.intimateHairModel.findByIdAndUpdate(id, {
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

    async updateMultipleIntimateHairById(
        ids: string[],
        updateIntimateHairDto: UpdateIntimateHairDto,
    ): Promise<ResponsePayload> {
        const mIds = ids.map((m) => new ObjectId(m));

        // Delete No Multiple Action Data
        if (updateIntimateHairDto.slug) {
            delete updateIntimateHairDto.slug;
        }

        try {
            await this.intimateHairModel.updateMany(
                {_id: {$in: mIds}},
                {$set: updateIntimateHairDto},
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
     * deleteIntimateHairById
     * deleteMultipleIntimateHairById
     */
    async deleteIntimateHairById(
        id: string,
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        let data;
        try {
            data = await this.intimateHairModel.findById(id);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
        if (!data) {
            throw new NotFoundException('No Data found!');
        }
        try {
            await this.intimateHairModel.findByIdAndDelete(id);
            // Reset Product IntimateHair Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {
                        $pull: {intimateHairs: new ObjectId(id)},
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

    async deleteMultipleIntimateHairById(
        ids: string[],
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        try {
            const mIds = ids.map((m) => new ObjectId(m));
            await this.intimateHairModel.deleteMany({_id: ids});
            // Reset Product Brand Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {$pull: {intimateHairs: {$in: mIds}}},
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
