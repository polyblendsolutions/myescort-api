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
import {Region} from '../../../interfaces/common/region.interface';
import {ResponsePayload} from '../../../interfaces/core/response-payload.interface';
import {ErrorCodes} from '../../../enum/error-code.enum';
import {
    AddRegionDto,
    FilterAndPaginationRegionDto,
    OptionRegionDto,
    UpdateRegionDto,
} from '../../../dto/region.dto';
import {Product} from '../../../interfaces/common/product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class RegionService {
    private logger = new Logger(RegionService.name);

    constructor(
        @InjectModel('Region') private readonly regionModel: Model<Region>,
        @InjectModel('Product') private readonly productModel: Model<Product>,
        private configService: ConfigService,
        private utilsService: UtilsService,
    ) {
    }

    /**
     * addRegion
     * insertManyRegion
     */
    async addRegion(addRegionDto: AddRegionDto): Promise<ResponsePayload> {
        const {name, slug} = addRegionDto;

        try {
            let finalSlug;
            const fData = await this.regionModel.findOne({slug: slug});

            if (fData) {
                finalSlug = this.utilsService.transformToSlug(slug, true);
            } else {
                finalSlug = slug;
            }

            const defaultData = {
                slug: finalSlug,
            };
            const mData = {...addRegionDto, ...defaultData};
            const newData = new this.regionModel(mData);

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

    async insertManyRegion(
        addRegionsDto: AddRegionDto[],
        optionRegionDto: OptionRegionDto,
    ): Promise<ResponsePayload> {
        const {deleteMany} = optionRegionDto;
        if (deleteMany) {
            await this.regionModel.deleteMany({});
        }
        const mData = addRegionsDto.map((m) => {
            return {
                ...m,
                ...{
                    slug: this.utilsService.transformToSlug(m.name),
                },
            };
        });
        try {
            const saveData = await this.regionModel.insertMany(mData);
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
     * getAllRegions
     * getRegionById
     */
    async getAllRegionsBasic() {
        try {
            const pageSize = 10;
            const currentPage = 3;
            const data = await this.regionModel
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

    async getAllRegions(
        filterRegionDto: FilterAndPaginationRegionDto,
        searchQuery?: string,
    ): Promise<ResponsePayload> {
        const {filter} = filterRegionDto;
        const {pagination} = filterRegionDto;
        const {sort} = filterRegionDto;
        const {select} = filterRegionDto;

        // Essential Variables
        const aggregateSregiones = [];
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
            aggregateSregiones.push({$match: mFilter});
        }

        if (Object.keys(mSort).length) {
            aggregateSregiones.push({$sort: mSort});
        }

        if (!pagination) {
            aggregateSregiones.push({$project: mSelect});
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

            aggregateSregiones.push(mPagination);

            aggregateSregiones.push({
                $project: {
                    data: 1,
                    count: {$arrayElemAt: ['$metadata.total', 0]},
                },
            });
        }

        try {
            const dataAggregates = await this.regionModel.aggregate(aggregateSregiones);
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

    async getRegionById(id: string, select: string): Promise<ResponsePayload> {
        try {
            const data = await this.regionModel.findById(id).select(select);
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
     * updateRegionById
     * updateMultipleRegionById
     */
    async updateRegionById(
        id: string,
        updateRegionDto: UpdateRegionDto,
    ): Promise<ResponsePayload> {
        try {
            const {name, slug} = updateRegionDto;

            let finalSlug;
            const fData = await this.regionModel.findById(id);

            // Check Slug
            if (fData.slug !== slug) {
                const fData = await this.regionModel.findOne({slug: slug});
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

            const finalData = {...updateRegionDto, ...defaultData};

            await this.regionModel.findByIdAndUpdate(id, {
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

    async updateMultipleRegionById(
        ids: string[],
        updateRegionDto: UpdateRegionDto,
    ): Promise<ResponsePayload> {
        const mIds = ids.map((m) => new ObjectId(m));

        // Delete No Multiple Action Data
        if (updateRegionDto.slug) {
            delete updateRegionDto.slug;
        }

        try {
            await this.regionModel.updateMany(
                {_id: {$in: mIds}},
                {$set: updateRegionDto},
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
     * deleteRegionById
     * deleteMultipleRegionById
     */
    async deleteRegionById(
        id: string,
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        let data;
        try {
            data = await this.regionModel.findById(id);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
        if (!data) {
            throw new NotFoundException('No Data found!');
        }
        try {
            await this.regionModel.findByIdAndDelete(id);
            // Reset Product Region Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {
                        $pull: {regions: new ObjectId(id)},
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

    async deleteMultipleRegionById(
        ids: string[],
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        try {
            const mIds = ids.map((m) => new ObjectId(m));
            await this.regionModel.deleteMany({_id: ids});
            // Reset Product Brand Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {$pull: {regions: {$in: mIds}}},
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
