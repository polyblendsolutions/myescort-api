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

import { RegionService } from './region.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { AddRegionDto, FilterAndPaginationRegionDto, OptionRegionDto, UpdateRegionDto } from '../../../dto/region.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('region')
export class RegionController {
  private logger = new Logger(RegionController.name);

  constructor(private regionService: RegionService) {}

  /**
   * addRegion
   * insertManyRegion
   *
   * @param addRegionDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addRegion(
    @Body()
    addRegionDto: AddRegionDto,
  ): Promise<ResponsePayload> {
    return await this.regionService.addRegion(addRegionDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyRegion(
    @Body()
    body: {
      data: AddRegionDto[];
      option: OptionRegionDto;
    },
  ): Promise<ResponsePayload> {
    return await this.regionService.insertManyRegion(body.data, body.option);
  }

  /**
   * getAllRegions
   * getRegionById
   *
   * @param filterRegionDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllRegions(
    @Body() filterRegionDto: FilterAndPaginationRegionDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.regionService.getAllRegions(filterRegionDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllRegionsBasic(): Promise<ResponsePayload> {
    return await this.regionService.getAllRegionsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getRegionById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.regionService.getRegionById(id, select);
  }

  /**
   * updateRegionById
   * updateMultipleRegionById
   *
   * @param id
   * @param updateRegionDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateRegionById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<ResponsePayload> {
    return await this.regionService.updateRegionById(id, updateRegionDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleRegionById(@Body() updateRegionDto: UpdateRegionDto): Promise<ResponsePayload> {
    return await this.regionService.updateMultipleRegionById(updateRegionDto.ids, updateRegionDto);
  }

  /**
   * deleteRegionById
   * deleteMultipleRegionById
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
  async deleteRegionById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.regionService.deleteRegionById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleRegionById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.regionService.deleteMultipleRegionById(data.ids, Boolean(checkUsage));
  }
}
