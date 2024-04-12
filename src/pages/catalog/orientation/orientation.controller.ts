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

import { OrientationService } from './orientation.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import {
  AddOrientationDto,
  FilterAndPaginationOrientationDto,
  OptionOrientationDto,
  UpdateOrientationDto,
} from '../../../dto/orientation.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('orientation')
export class OrientationController {
  private logger = new Logger(OrientationController.name);

  constructor(private orientationService: OrientationService) {}

  /**
   * addOrientation
   * insertManyOrientation
   *
   * @param addOrientationDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addOrientation(
    @Body()
    addOrientationDto: AddOrientationDto,
  ): Promise<ResponsePayload> {
    return await this.orientationService.addOrientation(addOrientationDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyOrientation(
    @Body()
    body: {
      data: AddOrientationDto[];
      option: OptionOrientationDto;
    },
  ): Promise<ResponsePayload> {
    return await this.orientationService.insertManyOrientation(body.data, body.option);
  }

  /**
   * getAllOrientations
   * getOrientationById
   *
   * @param filterOrientationDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllOrientations(
    @Body() filterOrientationDto: FilterAndPaginationOrientationDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.orientationService.getAllOrientations(filterOrientationDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllOrientationsBasic(): Promise<ResponsePayload> {
    return await this.orientationService.getAllOrientationsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getOrientationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.orientationService.getOrientationById(id, select);
  }

  /**
   * updateOrientationById
   * updateMultipleOrientationById
   *
   * @param id
   * @param updateOrientationDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateOrientationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateOrientationDto: UpdateOrientationDto,
  ): Promise<ResponsePayload> {
    return await this.orientationService.updateOrientationById(id, updateOrientationDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleOrientationById(@Body() updateOrientationDto: UpdateOrientationDto): Promise<ResponsePayload> {
    return await this.orientationService.updateMultipleOrientationById(updateOrientationDto.ids, updateOrientationDto);
  }

  /**
   * deleteOrientationById
   * deleteMultipleOrientationById
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
  async deleteOrientationById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.orientationService.deleteOrientationById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleOrientationById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.orientationService.deleteMultipleOrientationById(data.ids, Boolean(checkUsage));
  }
}
