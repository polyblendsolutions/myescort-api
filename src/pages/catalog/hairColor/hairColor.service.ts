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
import {HairColor} from '../../../interfaces/common/hairColor.interface';
import {ResponsePayload} from '../../../interfaces/core/response-payload.interface';
import {ErrorCodes} from '../../../enum/error-code.enum';
import {
    AddHairColorDto,
    FilterAndPaginationHairColorDto,
    OptionHairColorDto,
    UpdateHairColorDto,
} from '../../../dto/hairColor.dto';
import {Product} from '../../../interfaces/common/product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class HairColorService {
    private logger = new Logger(HairColorService.name);

    constructor(
        @InjectModel('HairColor') private readonly hairColorModel: Model<HairColor>,
        @InjectModel('Product') private readonly productModel: Model<Product>,
        private configService: ConfigService,
        private utilsService: UtilsService,
    ) {
    }

    /**
     * addHairColor
     * insertManyHairColor
     */
    async addHairColor(addHairColorDto: AddHairColorDto): Promise<ResponsePayload> {
        const {name, slug} = addHairColorDto;

        try {
            let finalSlug;
            const fData = await this.hairColorModel.findOne({slug: slug});

            if (fData) {
                finalSlug = this.utilsService.transformToSlug(slug, true);
            } else {
                finalSlug = slug;
            }

            const defaultData = {
                slug: finalSlug,
            };
            const mData = {...addHairColorDto, ...defaultData};
            const newData = new this.hairColorModel(mData);

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

    async insertManyHairColor(
        addHairColorsDto: AddHairColorDto[],
        optionHairColorDto: OptionHairColorDto,
    ): Promise<ResponsePayload> {
        const {deleteMany} = optionHairColorDto;
        if (deleteMany) {
            await this.hairColorModel.deleteMany({});
        }
        const mData = addHairColorsDto.map((m) => {
            return {
                ...m,
                ...{
                    slug: this.utilsService.transformToSlug(m.name),
                },
            };
        });
        try {
            const saveData = await this.hairColorModel.insertMany(mData);
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
     * getAllHairColors
     * getHairColorById
     */
    async getAllHairColorsBasic() {
        try {
            const pageSize = 10;
            const currentPage = 3;
            const data = await this.hairColorModel
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

    async getAllHairColors(
        filterHairColorDto: FilterAndPaginationHairColorDto,
        searchQuery?: string,
    ): Promise<ResponsePayload> {
        const {filter} = filterHairColorDto;
        const {pagination} = filterHairColorDto;
        const {sort} = filterHairColorDto;
        const {select} = filterHairColorDto;

        // Essential Variables
        const aggregateShairColores = [];
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
            aggregateShairColores.push({$match: mFilter});
        }

        if (Object.keys(mSort).length) {
            aggregateShairColores.push({$sort: mSort});
        }

        if (!pagination) {
            aggregateShairColores.push({$project: mSelect});
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

            aggregateShairColores.push(mPagination);

            aggregateShairColores.push({
                $project: {
                    data: 1,
                    count: {$arrayElemAt: ['$metadata.total', 0]},
                },
            });
        }

        try {
            const dataAggregates = await this.hairColorModel.aggregate(aggregateShairColores);
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

    async getHairColorById(id: string, select: string): Promise<ResponsePayload> {
        try {
            const data = await this.hairColorModel.findById(id).select(select);
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
     * updateHairColorById
     * updateMultipleHairColorById
     */
    async updateHairColorById(
        id: string,
        updateHairColorDto: UpdateHairColorDto,
    ): Promise<ResponsePayload> {
        try {
            const {name, slug} = updateHairColorDto;

            let finalSlug;
            const fData = await this.hairColorModel.findById(id);

            // Check Slug
            if (fData.slug !== slug) {
                const fData = await this.hairColorModel.findOne({slug: slug});
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

            const finalData = {...updateHairColorDto, ...defaultData};

            await this.hairColorModel.findByIdAndUpdate(id, {
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

    async updateMultipleHairColorById(
        ids: string[],
        updateHairColorDto: UpdateHairColorDto,
    ): Promise<ResponsePayload> {
        const mIds = ids.map((m) => new ObjectId(m));

        // Delete No Multiple Action Data
        if (updateHairColorDto.slug) {
            delete updateHairColorDto.slug;
        }

        try {
            await this.hairColorModel.updateMany(
                {_id: {$in: mIds}},
                {$set: updateHairColorDto},
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
     * deleteHairColorById
     * deleteMultipleHairColorById
     */
    async deleteHairColorById(
        id: string,
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        let data;
        try {
            data = await this.hairColorModel.findById(id);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
        if (!data) {
            throw new NotFoundException('No Data found!');
        }
        try {
            await this.hairColorModel.findByIdAndDelete(id);
            // Reset Product HairColor Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {
                        $pull: {hairColors: new ObjectId(id)},
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

    async deleteMultipleHairColorById(
        ids: string[],
        checkUsage: boolean,
    ): Promise<ResponsePayload> {
        try {
            const mIds = ids.map((m) => new ObjectId(m));
            await this.hairColorModel.deleteMany({_id: ids});
            // Reset Product Brand Reference
            if (checkUsage) {
                // Update Product
                await this.productModel.updateMany(
                    {},
                    {$pull: {hairColors: {$in: mIds}}},
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
