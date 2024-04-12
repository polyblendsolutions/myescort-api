import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../../decorator/get-token-user.decorator';
import {
  AddOrderDto,
  FilterAndPaginationOrderDto,
  OptionOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from '../../../dto/order.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { User } from '../../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('order')
export class OrderController {
  private logger = new Logger(OrderController.name);

  constructor(private orderService: OrderService) {}

  /**
   * addOrder
   * insertManyOrder
   *
   * @param addOrderDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addOrder(
    @Body()
    addOrderDto: AddOrderDto,
  ): Promise<ResponsePayload> {
    return await this.orderService.addOrder(addOrderDto);
  }

  @Put('/updateDate')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateDate(): Promise<ResponsePayload> {
    return await this.orderService.updateDate();
  }

  @Post('/add-order-by-user')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async addOrderByUser(
    @Body()
    addOrderDto: AddOrderDto,
    @GetTokenUser() user: User,
  ): Promise<ResponsePayload> {
    return await this.orderService.addOrderByUser(addOrderDto, user);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyOrder(
    @Body()
    body: {
      data: AddOrderDto[];
      option: OptionOrderDto;
    },
  ): Promise<ResponsePayload> {
    return await this.orderService.insertManyOrder(body.data, body.option);
  }

  /**
   * getAllOrders
   * getOrderById
   *
   * @param filterOrderDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllOrders(
    @Body() filterOrderDto: FilterAndPaginationOrderDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.orderService.getAllOrders(filterOrderDto, searchString);
  }

  @Post('/get-orders-by-user')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async getOrdersByUser(
    @GetTokenUser() user: User,
    @Body() filterOrderDto: FilterAndPaginationOrderDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.orderService.getOrdersByUser(user, filterOrderDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.orderService.getOrderById(id, select);
  }

  /**
   * updateOrderById
   * updateMultipleOrderById
   *
   * @param id
   * @param updateOrderDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponsePayload> {
    return await this.orderService.updateOrderById(id, updateOrderDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleOrderById(@Body() updateOrderDto: UpdateOrderDto): Promise<ResponsePayload> {
    return await this.orderService.updateMultipleOrderById(updateOrderDto.ids, updateOrderDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/change-status/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async changeOrderStatus(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<ResponsePayload> {
    return await this.orderService.changeOrderStatus(id, updateOrderStatusDto);
  }

  /**
   * deleteOrderById
   * deleteMultipleOrderById
   *
   * @param id
   * @param checkUsage
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteOrderById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.orderService.deleteOrderById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleOrderById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.orderService.deleteMultipleOrderById(data.ids, Boolean(checkUsage));
  }
}
