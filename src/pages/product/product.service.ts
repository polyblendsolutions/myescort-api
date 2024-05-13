import {
  BadRequestException,
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { ListingStatus } from 'src/enum/listing-status.enum';

import {
  AddProductDto,
  FilterAndPaginationProductDto,
  GetProductByIdsDto,
  OptionProductDto,
  UpdateProductDto,
} from '../../dto/product.dto';
import { ErrorCodes } from '../../enum/error-code.enum';
import { Product } from '../../interfaces/common/product.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { UtilsService } from '../../shared/utils/utils.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);
  private readonly cacheProductPage = 'getAllProducts?page=1';
  private readonly cacheProductCount = 'getAllProducts?count';

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private configService: ConfigService,
    private utilsService: UtilsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * addProduct
   * insertManyProduct
   *
   * @param addProductDto
   */
  async addProduct(addProductDto: AddProductDto): Promise<ResponsePayload> {
    try {
      const { name, quantity } = addProductDto;

      const defaultData = {
        // slug: this.utilsService.transformToSlug(name, true),

        quantity: quantity ? quantity : 0,
      };
      const mData = { ...addProductDto, ...defaultData };
      const newData = new this.productModel(mData);

      const saveData = await newData.save();
      const data = {
        _id: saveData._id,
      };

      const shortId = this.utilsService.generateUniqueId(saveData._id.toString());
      const updateData = await this.productModel.findOneAndUpdate({ _id: saveData._id }, { shortId }, { new: true });
      if (!updateData) {
        this.logger.error('Not able to update!');
        return {
          success: false,
          message: "Not able to update!",
        } as ResponsePayload;
      }
      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Data Added Success',
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

  async addProductByUser(user: User, addProductDto: AddProductDto): Promise<ResponsePayload> {
    try {
      const fData = await this.productModel.findOne({
        'user._id': user._id,
        publishDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
        },
      });
      if (fData) {
        return {
          success: false,
          message: 'Fejl, kun en annonce er tilladt',
        } as ResponsePayload;
      } else {
        const { name, quantity } = addProductDto;
        const fUser = await this.userModel.findById(user._id);

        const defaultData = {
          slug: this.utilsService.transformToSlug(name, true),
          quantity: quantity ? quantity : 0,
          user: fUser,
        };
        const mData = {
          ...addProductDto,
          ...defaultData,
          publishDate: new Date(),
        };
        const newData = new this.productModel(mData);
        console.log('mdar', newData);

        const saveData = await newData.save();
        const data = {
          _id: saveData._id,
        };

        return {
          success: true,
          message: 'Data Added Success',
          data,
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async cloneSingleProduct(id: string): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findById(id);
      const jData = JSON.stringify(data);
      const product = JSON.parse(jData);

      product.name = `${product.name}(Clone-${this.utilsService.getRandomInt(0, 100)})`;
      product.slug = this.utilsService.transformToSlug(product.name, true);
      product.sku = `${product.sku}-${this.utilsService.getRandomInt(0, 100)}`;
      product.quantity = 0;
      delete product._id;
      delete product.createdAt;
      delete product.updatedAt;

      const newData = new this.productModel(product);
      const saveData = await newData.save();

      const response = {
        _id: saveData._id,
      };

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Data Clone Success',
        data: response,
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      // console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async insertManyProduct(
    addProductsDto: AddProductDto[],
    optionProductDto: OptionProductDto,
  ): Promise<ResponsePayload> {
    const { deleteMany } = optionProductDto;
    if (deleteMany) {
      await this.productModel.deleteMany({});
    }
    const mData = addProductsDto.map((m) => {
      return {
        ...m,
        ...{
          slug: this.utilsService.transformToSlug(m.name),
        },
      };
    });
    try {
      const saveData = await this.productModel.insertMany(mData);

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: `${saveData && saveData.length ? saveData.length : 0}  Data Added Success`,
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

  /**
   * getAllProducts
   * getProductById
   *
   * @param filterProductDto
   * @param searchQuery
   * @param isUser
   */
  async getAllProducts(
    filterProductDto: FilterAndPaginationProductDto,
    searchQuery?: string
  ): Promise<ResponsePayload> {
    const { filter } = filterProductDto;
    const { pagination } = filterProductDto;
    const { sort } = filterProductDto;
    const { select } = filterProductDto;
    const { filterGroup } = filterProductDto;
    let showExpired = false;
    // if (
    //   pagination.currentPage < 1 &&
    //   filter == null &&
    //   JSON.stringify(sort) == JSON.stringify({ createdAt: -1 })
    // ) {
    //   const cache: object[] = await this.cacheManager.get(
    //     this.cacheProductPage,
    //   );
    //   const count: number = await this.cacheManager.get(this.cacheProductCount);
    //   if (cache) {
    //     this.logger.log('Cached page');
    //     return {
    //       data: cache,
    //       success: true,
    //       message: 'Success',
    //       count: count,
    //     } as ResponsePayload;
    //   }
    // }

    // Aggregate Stages
    const aggregateStages = [];
    const aggregateCategoryGroupStages = [];
    const aggregateBrandGroupStages = [];
    const aggregatePublisherGroupStages = [];
    const aggregateSubCategoryGroupStages = [];

    // Essential Variables
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};
    let statusList = [ListingStatus.Deleted, ListingStatus.Draft]
    // Modify Id as Object ID
    // Match
    if (filter) {
      const keysToConvert = ['category._id', 'subCategory._id', 'brand._id', 'publisher._id', 'tags._id'];
      // Convert specified keys to ObjectId
      keysToConvert.forEach((key) => {
        if (filter[key]) {
          filter[key] = new ObjectId(filter[key]);
        }
      });

      if (filter['showExpired']) {
        showExpired = filter['showExpired'];
        delete filter['showExpired'];
      }

      if(!filter['isVipStatusActive']){
        filter['isVipStatusActive'] = { $exists: false }
      }

      if (filter['createdAt']) {
        filter['createdAt']['$gte'] = new Date(filter['createdAt']['$gte']);
        filter['createdAt']['$lte'] = new Date(filter['createdAt']['$lte']);
      }

      if (filter['user._id']) {
        filter['user._id'] = new ObjectId(filter['user._id']);
        // It will not remove delete ads from the listing 
        statusList = [ListingStatus.Deleted]
      }

      mFilter = { ...mFilter, ...filter };
    }
    mFilter['status'] = { $nin: statusList }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { name: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { slug: new RegExp(searchQuery, 'i') },
              { 'category.name': new RegExp(searchQuery, 'i') },
              { 'type.name': new RegExp(searchQuery, 'i') },
              { 'division.name': new RegExp(searchQuery, 'i') },
              { 'zone.name': new RegExp(searchQuery, 'i') },
              { 'area.name': new RegExp(searchQuery, 'i') },
              { age: new RegExp(searchQuery, 'i') },
              { height: new RegExp(searchQuery, 'i') },
              { weight: new RegExp(searchQuery, 'i') },
              { 'bodyType.name': new RegExp(searchQuery, 'i') },
              { shortDescription: new RegExp(searchQuery, 'i') },
              { address: new RegExp(searchQuery, 'i') },
              { 'hairColor.name': new RegExp(searchQuery, 'i') },
              { 'orientation.name': new RegExp(searchQuery, 'i') },
              { 'intimateHair.name': new RegExp(searchQuery, 'i') },
              { phone: new RegExp(searchQuery, 'i') },
              { whatsApp: new RegExp(searchQuery, 'i') },
            ],
          },
        ],
      };
      // mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
    }
    // Sort
    if (sort) {
      mSort = sort;
      mSort['bumpDate'] = -1;
    } else {
      mSort = { bumpDate: -1 };
    }
    // Select
    if (select) {
      mSelect = { ...select, publishDate: 1 };
    } else {
      mSelect = { name: 1 };
    }

    // GROUPING FOR FILTER PRODUCTS
    let groupCategory;
    let groupBrand;
    let groupSubCategory;
    let groupPublisher;

    if (filterGroup && filterGroup.isGroup) {
      if (filterGroup.category) {
        groupCategory = {
          $group: {
            _id: { category: '$category._id' },
            name: { $first: '$category.name' },
            slug: { $first: '$category.slug' },
            total: { $sum: 1 },
          },
        };
      }

      if (filterGroup.brand) {
        groupBrand = {
          $group: {
            _id: { brand: '$brand._id' },
            name: { $first: '$brand.name' },
            slug: { $first: '$brand.slug' },
            total: { $sum: 1 },
          },
        };
      }

      if (filterGroup.subCategory) {
        groupSubCategory = {
          $group: {
            _id: { subCategory: '$subCategory._id' },
            name: { $first: '$subCategory.name' },
            slug: { $first: '$subCategory.slug' },
            total: { $sum: 1 },
          },
        };
      }

      if (filterGroup.publisher) {
        groupPublisher = {
          $group: {
            _id: { publisher: '$publisher._id' },
            name: { $first: '$publisher.name' },
            slug: { $first: '$publisher.slug' },
            total: { $sum: 1 },
          },
        };
      }
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      // Main
      aggregateStages.push({ $match: mFilter });

      // Category Groups
      if (groupCategory) {
        // aggregateCategoryGroupStages.push({ $match: mFilter });
        aggregateCategoryGroupStages.push(groupCategory);
      }

      // Sub Category Groups
      if (groupSubCategory) {
        // aggregateSubCategoryGroupStages.push({ $match: mFilter });
        aggregateSubCategoryGroupStages.push(groupSubCategory);
      }

      // Brand Groups
      if (groupBrand) {
        // aggregateBrandGroupStages.push({ $match: mFilter });
        aggregateBrandGroupStages.push(groupBrand);
      }
      // Publisher Groups
      if (groupPublisher) {
        // aggregatePublisherGroupStages.push({ $match: mFilter });
        aggregatePublisherGroupStages.push(groupPublisher);
      }
    } else {
      if (groupCategory) {
        aggregateCategoryGroupStages.push(groupCategory);
      }
      if (groupSubCategory) {
        aggregateSubCategoryGroupStages.push(groupSubCategory);
      }
      if (groupBrand) {
        aggregateBrandGroupStages.push(groupBrand);
      }
      if (groupPublisher) {
        aggregatePublisherGroupStages.push(groupPublisher);
      }
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
      if (!showExpired) {
        aggregateStages[0]['$match']['publishDate'] = {};
        aggregateStages[0]['$match']['publishDate']['$gte'] = new Date(
          new Date().getFullYear(),
          new Date().getMonth() - 1,
          new Date().getDate(),
        );
      }
      // Main
      const dataAggregates = await this.productModel.aggregate(aggregateStages);

      // GROUP FILTER PRODUCTS DATA
      let categoryAggregates;
      let subCategoryAggregates;
      let brandAggregates;
      let publisherAggregates;
      // Category
      if (filterGroup && filterGroup.isGroup && filterGroup.category) {
        categoryAggregates = await this.productModel.aggregate(aggregateCategoryGroupStages);
      }

      // Sub Category
      if (filterGroup && filterGroup.isGroup && filterGroup.subCategory) {
        subCategoryAggregates = await this.productModel.aggregate(aggregateSubCategoryGroupStages);
      }

      // Brand
      if (filterGroup && filterGroup.isGroup && filterGroup.brand) {
        brandAggregates = await this.productModel.aggregate(aggregateBrandGroupStages);
      }

      // Publisher
      if (filterGroup && filterGroup.isGroup && filterGroup.publisher) {
        publisherAggregates = await this.productModel.aggregate(aggregatePublisherGroupStages);
      }

      // Main Filter Data
      let allFilterGroups;
      if (filterGroup && filterGroup.isGroup) {
        allFilterGroups = {
          categories: categoryAggregates && categoryAggregates.length ? categoryAggregates : [],
          subCategories: subCategoryAggregates && subCategoryAggregates.length ? subCategoryAggregates : [],
          brands: brandAggregates && brandAggregates.length ? brandAggregates : [],
          publishers: publisherAggregates && publisherAggregates.length ? publisherAggregates : [],
        };
      } else {
        allFilterGroups = null;
      }

      if (pagination) {
        if (pagination.currentPage < 1 && filter == null && JSON.stringify(sort) == JSON.stringify({ createdAt: -1 })) {
          await this.cacheManager.set(this.cacheProductPage, dataAggregates[0].data);
          await this.cacheManager.set(this.cacheProductCount, dataAggregates[0].count);
          this.logger.log('Cache Added');
        }

        return {
          ...{ ...dataAggregates[0] },
          ...{
            success: true,
            message: 'Success',
            filterGroup: allFilterGroups,
          },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
          filterGroup: allFilterGroups,
        } as ResponsePayload;
      }
    } catch (err) {
      console.log('errr>>>>', err);
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getAllAdminProducts(
    filterProductDto: FilterAndPaginationProductDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductDto;
    const { pagination } = filterProductDto;
    const { sort } = filterProductDto;
    const { select } = filterProductDto;
    const { filterGroup } = filterProductDto;

    // Aggregate Stages
    const aggregateStages = [];
    const aggregateCategoryGroupStages = [];
    const aggregateBrandGroupStages = [];
    const aggregatePublisherGroupStages = [];
    const aggregateSubCategoryGroupStages = [];

    // Essential Variables
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};
    // Modify Id as Object ID
    // Match
    if (filter) {
      const keysToConvert = ['user._id', 'category._id', 'subCategory._id', 'brand._id', 'publisher._id', 'tags._id'];

      // Convert specified keys to ObjectId
      keysToConvert.forEach((key) => {
        if (filter[key]) {
          filter[key] = new ObjectId(filter[key]);
        }
      });

      if (filter['createdAt']) {
        filter['createdAt']['$gte'] = new Date(filter['createdAt']['$gte']);
        filter['createdAt']['$lte'] = new Date(filter['createdAt']['$lte']);
      }

      mFilter = { ...mFilter, ...filter };
    }

    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { name: new RegExp(searchQuery, 'i') },
              { email: new RegExp(searchQuery, 'i') },
              { slug: new RegExp(searchQuery, 'i') },
              { 'category.name': new RegExp(searchQuery, 'i') },
              { 'type.name': new RegExp(searchQuery, 'i') },
              { 'division.name': new RegExp(searchQuery, 'i') },
              { 'zone.name': new RegExp(searchQuery, 'i') },
              { 'area.name': new RegExp(searchQuery, 'i') },
              { age: new RegExp(searchQuery, 'i') },
              { height: new RegExp(searchQuery, 'i') },
              { weight: new RegExp(searchQuery, 'i') },
              { 'bodyType.name': new RegExp(searchQuery, 'i') },
              { shortDescription: new RegExp(searchQuery, 'i') },
              { address: new RegExp(searchQuery, 'i') },
              { 'hairColor.name': new RegExp(searchQuery, 'i') },
              { 'orientation.name': new RegExp(searchQuery, 'i') },
              { 'intimateHair.name': new RegExp(searchQuery, 'i') },
              { phone: new RegExp(searchQuery, 'i') },
              { whatsApp: new RegExp(searchQuery, 'i') },
            ],
          },
        ],
      };
      // mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
    }
    // Sort
    if (sort) {
      mSort = sort;
    } else {
      mSort = { createdAt: -1 };
    }
    // Select
    if (select) {
      mSelect = { ...select, publishDate: 1 };
    } else {
      mSelect = { name: 1 };
    }

    // GROUPING FOR FILTER PRODUCTS
    let groupCategory;
    let groupBrand;
    let groupSubCategory;
    let groupPublisher;

    if (filterGroup && filterGroup.isGroup) {
      if (filterGroup.category) {
        groupCategory = {
          $group: {
            _id: { category: '$category._id' },
            name: { $first: '$category.name' },
            slug: { $first: '$category.slug' },
            total: { $sum: 1 },
          },
        };
      }

      if (filterGroup.brand) {
        groupBrand = {
          $group: {
            _id: { brand: '$brand._id' },
            name: { $first: '$brand.name' },
            slug: { $first: '$brand.slug' },
            total: { $sum: 1 },
          },
        };
      }

      if (filterGroup.subCategory) {
        groupSubCategory = {
          $group: {
            _id: { subCategory: '$subCategory._id' },
            name: { $first: '$subCategory.name' },
            slug: { $first: '$subCategory.slug' },
            total: { $sum: 1 },
          },
        };
      }

      if (filterGroup.publisher) {
        groupPublisher = {
          $group: {
            _id: { publisher: '$publisher._id' },
            name: { $first: '$publisher.name' },
            slug: { $first: '$publisher.slug' },
            total: { $sum: 1 },
          },
        };
      }
    }
    mFilter['status'] = { $ne: ListingStatus.Deleted }
    // Finalize
    if (Object.keys(mFilter).length) {
      // Main
      aggregateStages.push({ $match: mFilter });

      // Category Groups
      if (groupCategory) {
        // aggregateCategoryGroupStages.push({ $match: mFilter });
        aggregateCategoryGroupStages.push(groupCategory);
      }

      // Sub Category Groups
      if (groupSubCategory) {
        // aggregateSubCategoryGroupStages.push({ $match: mFilter });
        aggregateSubCategoryGroupStages.push(groupSubCategory);
      }

      // Brand Groups
      if (groupBrand) {
        // aggregateBrandGroupStages.push({ $match: mFilter });
        aggregateBrandGroupStages.push(groupBrand);
      }
      // Publisher Groups
      if (groupPublisher) {
        // aggregatePublisherGroupStages.push({ $match: mFilter });
        aggregatePublisherGroupStages.push(groupPublisher);
      }
    } else {
      if (groupCategory) {
        aggregateCategoryGroupStages.push(groupCategory);
      }
      if (groupSubCategory) {
        aggregateSubCategoryGroupStages.push(groupSubCategory);
      }
      if (groupBrand) {
        aggregateBrandGroupStages.push(groupBrand);
      }
      if (groupPublisher) {
        aggregatePublisherGroupStages.push(groupPublisher);
      }
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
      // Main
      const dataAggregates = await this.productModel.aggregate(aggregateStages);

      // GROUP FILTER PRODUCTS DATA
      let categoryAggregates;
      let subCategoryAggregates;
      let brandAggregates;
      let publisherAggregates;
      // Category
      if (filterGroup && filterGroup.isGroup && filterGroup.category) {
        categoryAggregates = await this.productModel.aggregate(aggregateCategoryGroupStages);
      }

      // Sub Category
      if (filterGroup && filterGroup.isGroup && filterGroup.subCategory) {
        subCategoryAggregates = await this.productModel.aggregate(aggregateSubCategoryGroupStages);
      }

      // Brand
      if (filterGroup && filterGroup.isGroup && filterGroup.brand) {
        brandAggregates = await this.productModel.aggregate(aggregateBrandGroupStages);
      }

      // Publisher
      if (filterGroup && filterGroup.isGroup && filterGroup.publisher) {
        publisherAggregates = await this.productModel.aggregate(aggregatePublisherGroupStages);
      }

      // Main Filter Data
      let allFilterGroups;
      if (filterGroup && filterGroup.isGroup) {
        allFilterGroups = {
          categories: categoryAggregates && categoryAggregates.length ? categoryAggregates : [],
          subCategories: subCategoryAggregates && subCategoryAggregates.length ? subCategoryAggregates : [],
          brands: brandAggregates && brandAggregates.length ? brandAggregates : [],
          publishers: publisherAggregates && publisherAggregates.length ? publisherAggregates : [],
        };
      } else {
        allFilterGroups = null;
      }

      if (pagination) {
        if (pagination.currentPage < 1 && filter == null && JSON.stringify(sort) == JSON.stringify({ createdAt: -1 })) {
          await this.cacheManager.set(this.cacheProductPage, dataAggregates[0].data);
          await this.cacheManager.set(this.cacheProductCount, dataAggregates[0].count);
          this.logger.log('Cache Added');
        }

        return {
          ...{ ...dataAggregates[0] },
          ...{
            success: true,
            message: 'Success',
            filterGroup: allFilterGroups,
          },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
          filterGroup: allFilterGroups,
        } as ResponsePayload;
      }
    } catch (err) {
      console.log('errr>>>>', err);
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getProductById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findById(id).lean(true).select(select).populate('tags');
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductByShortId(shortId: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findOne({ shortId }).lean(true).select(select).populate('tags');
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductBySlug(slug: string, select: string): Promise<ResponsePayload> {
    try {
      console.log('slug', slug);
      const data = await this.productModel.findOne({ slug: slug }).select(select).populate('tags');

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getProductByIds(getProductByIdsDto: GetProductByIdsDto, select: string): Promise<ResponsePayload> {
    try {
      const mIds = getProductByIdsDto.ids.map((m) => new ObjectId(m));
      const data = await this.productModel.find({ _id: { $in: mIds } });
      // .select(select ? select : '');
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
   * updateProductById
   * updateMultipleProductById
   * updateUserProductById
   *
   * @param id
   * @param updateProductDto
   */
  async updateProductById(id: string, updateProductDto: UpdateProductDto): Promise<ResponsePayload> {
    const { name } = updateProductDto;
    let data;
    try {
      data = await this.productModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      const finalData = { ...updateProductDto };
      // Check Slug
      if (name)
        if (name && data.name !== name) {
          finalData.slug = this.utilsService.transformToSlug(name, true);
          finalData.quantity = finalData.quantity ? finalData.quantity : 0;
        }

      await this.productModel.findByIdAndUpdate(id, {
        $set: finalData,
      });

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateUserProductById(user: User, id: string, updateProductDto: UpdateProductDto): Promise<ResponsePayload> {
    const { name } = updateProductDto;
    let data;
    try {
      data = await this.productModel.findOne({ _id: id, 'user._id': user._id });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      const finalData = { ...updateProductDto };
      // Check Slug
      if (name)
        if (name && data.name !== name) {
          finalData.slug = this.utilsService.transformToSlug(name, true);
          finalData.quantity = finalData.quantity ? finalData.quantity : 0;
        }
      if (finalData['status'] === ListingStatus.Publish) {
        finalData['publishDate'] = new Date();
      }
      await this.productModel.findByIdAndUpdate(id, {
        $set: finalData,
      });

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * bumpProductById
   *
   * @param user
   * @param id
   */
  async bumpProductById(user: User, id: string): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productModel.findOne({ _id: id, 'user._id': user._id });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No listing found!');
    }
    try {
      await this.productModel.findByIdAndUpdate(id, {
        $set: { bumpDate: new Date() },
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleProductById(ids: string[], updateProductDto: UpdateProductDto): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    // Delete No Multiple Action Data
    if (updateProductDto.slug) {
      delete updateProductDto.slug;
    }

    try {
      await this.productModel.updateMany({ _id: { $in: mIds } }, { $set: updateProductDto });

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * deleteProductById
   * deleteMultipleProductById
   *
   * @param {string} id - The unique identifier of the product to be deleted.
   * @param {string} deletedBy - deletedBy is the id of the admin that deleted that product.
   */
  async deleteProductById(id: string, deletedBy: string): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      await this.productModel.findByIdAndUpdate(id, { status: ListingStatus.Deleted, deletedBy: deletedBy });

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Success Delete',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteUserProductById(user: User, id: string): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productModel.findOne({ _id: id, 'user._id': user._id });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    try {
      await this.productModel.findByIdAndDelete(id);

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Success Delete',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * deleteMultipleProductByIds
   *
   * @param {string[]} ids - The unique identifiers of the products to be deleted.
   * @param {string} deletedBy - deletedBy is the id of the admin that deleted that product.
   */
  public async deleteMultipleProductById(ids: string[], deletedBy: string): Promise<ResponsePayload> {
    try {
      await this.productModel.updateMany(
        { _id: { $in: ids } },
        { $set: { status: ListingStatus.Deleted, deletedBy: deletedBy } }
      );

      // Cache Removed
      await this.cacheManager.del(this.cacheProductPage);
      await this.cacheManager.del(this.cacheProductCount);
      this.logger.log('Cache Removed');

      return {
        success: true,
        message: 'Success Delete',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async setProductQtyNotNull(): Promise<ResponsePayload> {
    try {
      const data1 = await this.productModel.countDocuments({});

      const data2 = await this.productModel.countDocuments({
        quantity: { $exists: true },
      });

      const data3 = await this.productModel.countDocuments({
        quantity: { $exists: false },
      });

      const data4 = await this.productModel.countDocuments({
        quantity: { $eq: null },
      });

      await this.productModel.updateMany(
        { quantity: { $eq: null } },
        {
          $set: { quantity: 0 },
        },
      );

      return {
        success: true,
        message: 'Success',
        data: {
          all: data1,
          exists: data2,
          existsNot: data3,
          nullData: data4,
        },
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async setProductImageHttpToHttps(): Promise<ResponsePayload> {
    try {
      const data1 = await this.productModel.find({});

      const mData1 = JSON.parse(JSON.stringify(data1));

      for (const product of mData1) {
        if (product.images && product.images.length) {
          const mImages = product.images.map((m) => {
            return m.replace('http://', 'https://');
          });
          await this.productModel.findByIdAndUpdate(product._id, {
            $set: {
              images: mImages,
            },
          });
        }
      }

      return {
        success: true,
        message: 'Success',
        data: null,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
