import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import { ShippingChargeService } from './shipping-charge.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { AddShippingChargeDto } from '../../../dto/shipping-charge.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';

@Controller('shipping-charge')
export class ShippingChargeController {
  private logger = new Logger(ShippingChargeController.name);

  constructor(private shippingChargeService: ShippingChargeService) {}

  /**
   * addShippingCharge
   * insertManyShippingCharge
   *
   * @param addShippingChargeDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addShippingCharge(
    @Body()
    addShippingChargeDto: AddShippingChargeDto,
  ): Promise<ResponsePayload> {
    return await this.shippingChargeService.addShippingCharge(addShippingChargeDto);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get')
  async getShippingCharge(@Query() select: string): Promise<ResponsePayload> {
    return await this.shippingChargeService.getShippingCharge(select);
  }
}
