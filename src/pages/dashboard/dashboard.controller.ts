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

import { DashboardService } from './dashboard.service';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../decorator/get-token-user.decorator';
import { FilterAndPaginationOrderDto } from '../../dto/order.dto';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';

@Controller('dashboard')
export class DashboardController {
  private logger = new Logger(DashboardController.name);

  constructor(private dashboardService: DashboardService) {}

  /**
   * GET
   * getAdminDashboard()
   */

  @Version(VERSION_NEUTRAL)
  @Get('/admin-dashboard')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getAdminDashboard(
    @Body() filterOrderDto: FilterAndPaginationOrderDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return await this.dashboardService.getAdminDashboard(filterOrderDto, searchString);
  }

  // @Version(VERSION_NEUTRAL)
  // @Post('/admin-dashboard-order')
  // // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // // @UseGuards(AdminRolesGuard)
  // // @UseGuards(AdminJwtAuthGuard)
  // async getAllOrdersForDashbord(
  //   @Body() filterOrderDto: FilterAndPaginationOrderDto,
  //   @Query('q') searchString: string,
  // ): Promise<ResponsePayload> {
  //   return this.dashboardService.getAllOrdersForDashbord(
  //     filterOrderDto,
  //     searchString,
  //   );
  // }
}
