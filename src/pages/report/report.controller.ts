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
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';

import { ReportService } from './report.service';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { GetUser } from '../../decorator/get-user.decorator';
import { FilterAndPaginationProductDto, GetProductByIdsDto } from '../../dto/product.dto';
import {
  AddReportDto,
  FilterAndPaginationReportDto,
  GetReportByIdsDto,
  OptionReportDto,
  UpdateReportDto,
} from '../../dto/report.dto';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('report')
export class ReportController {
  private logger = new Logger(ReportController.name);

  constructor(private reportService: ReportService) {}

  /**
   * addReport
   * insertManyReport
   *
   * @param user
   * @param addReportDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @UseGuards(UserJwtAuthGuard)
  async addReport(
    @GetUser() user: User,
    @Body()
    addReportDto: AddReportDto,
  ): Promise<ResponsePayload> {
    return await this.reportService.addReport(user, addReportDto);
  }

  @Post('/add-by-admin')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async adddReportByAdmin(
    @GetAdmin() admin: Admin,
    @Body()
    addReportDto: AddReportDto,
  ): Promise<ResponsePayload> {
    return await this.reportService.addReportByAdmin(admin, addReportDto);
  }

  /**
   * getAllReports
   * getReportById
   */

  @Version(VERSION_NEUTRAL)
  @Post('/get-all-report')
  // @UsePipes(ValidationPipe)
  async getAllReports(): Promise<ResponsePayload> {
    return this.reportService.getAllReports();
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-all-report-by-query')
  // @UsePipes(ValidationPipe)
  async getAllReportsByQuery(
    @Body() filterReportDto: FilterAndPaginationReportDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.reportService.getAllReportsByQuery(filterReportDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getReportById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.reportService.getReportById(id, select);
  }

  /**
   * updateReportById
   * updateMultipleReportById
   *
   * @param id
   * @param updateReportDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateReportById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ResponsePayload> {
    console.log('updateReportDto', updateReportDto);
    return await this.reportService.updateReportById(id, updateReportDto);
  }

  /**
   * deleteReportById
   * deleteMultipleReportById
   *
   * @param id
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteReportById(@Param('id', MongoIdValidationPipe) id: string): Promise<ResponsePayload> {
    return await this.reportService.deleteReportById(id);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleBlogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.reportService.deleteMultipleReportById(data.ids, Boolean(checkUsage));
  }
}
