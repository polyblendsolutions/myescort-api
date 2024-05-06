import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { FilterAndPaginationOrderDto } from '../../dto/order.dto';
import { ErrorCodes } from '../../enum/error-code.enum';
import { Admin } from '../../interfaces/admin/admin.interface';
import { Order } from '../../interfaces/common/order.interface';
import { Product } from '../../interfaces/common/product.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { UtilsService } from '../../shared/utils/utils.service';
import { VerifiedStatus } from 'src/enum/verified-status.enum';

const ObjectId = Types.ObjectId;

@Injectable()
export class DashboardService {
  private logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Order')
    private readonly orderModel: Model<Product>,
    @InjectModel('Report')
    private readonly reportModel: Model<Order>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) { }

  async getAdminDashboard(filterOrderDto: FilterAndPaginationOrderDto, searchQuery?: string): Promise<ResponsePayload> {
    const { filter } = filterOrderDto;
    try {

      const totalProducts = await this.productModel.countDocuments({ isDeleted: false });
      const totalUsers = await this.userModel.countDocuments({ hasAccess: true });
      const awaitingVerification = await this.userModel.countDocuments({ verifiedStatus: VerifiedStatus.Pending });
      const newReport = await this.reportModel.countDocuments({ status: false });
      const vipUsers = await this.userModel.countDocuments({ subscriptionId: { $ne: null } })

      const data = {
        totalProducts,
        totalUsers,
        awaitingVerification,
        newReport,
        vipUsers
      };

      return {
        success: true,
        message: 'Data Retrieve Success',
        data,
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllOrdersForDashbord(
    filterOrderDto: FilterAndPaginationOrderDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterOrderDto;
    const { pagination } = filterOrderDto;
    const { sort } = filterOrderDto;
    const { select } = filterOrderDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};

    // Calculations
    const aggregateStagesCalculation = [];

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };
      aggregateStagesCalculation.push({ $match: mFilter });
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

    try {
      const group = {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          sumPurchasePrice: { $sum: '$purchasePrice' },
          sumSalePrice: { $sum: '$salePrice' },
          totalPurchasePrice: {
            $sum: {
              $multiply: ['$purchasePrice', '$quantity'],
            },
          },
          totalSalePrice: {
            $sum: {
              $multiply: ['$salePrice', '$quantity'],
            },
          },
        },
      };
      aggregateStagesCalculation.push(group);
      const calculateAggregates = await this.orderModel.aggregate(aggregateStagesCalculation);

      return {
        // data: dataAggregates,
        success: true,
        message: 'Success',
        calculation: calculateAggregates[0],
      } as ResponsePayload;
    } catch (err) {
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
