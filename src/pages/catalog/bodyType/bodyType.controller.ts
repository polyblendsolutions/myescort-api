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

import { BodyTypeService } from './bodyType.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import {
  AddBodyTypeDto,
  FilterAndPaginationBodyTypeDto,
  OptionBodyTypeDto,
  UpdateBodyTypeDto,
} from '../../../dto/body-type.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('bodyType')
export class BodyTypeController {
  private logger = new Logger(BodyTypeController.name);

  constructor(private bodyTypeService: BodyTypeService) {}

  /**
   * addBodyType
   * insertManyBodyType
   *
   * @param addBodyTypeDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addBodyType(
    @Body()
    addBodyTypeDto: AddBodyTypeDto,
  ): Promise<ResponsePayload> {
    return await this.bodyTypeService.addBodyType(addBodyTypeDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyBodyType(
    @Body()
    body: {
      data: AddBodyTypeDto[];
      option: OptionBodyTypeDto;
    },
  ): Promise<ResponsePayload> {
    return await this.bodyTypeService.insertManyBodyType(body.data, body.option);
  }

  /**
   * getAllBodyTypes
   * getBodyTypeById
   *
   * @param filterBodyTypeDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllBodyTypes(
    @Body() filterBodyTypeDto: FilterAndPaginationBodyTypeDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.bodyTypeService.getAllBodyTypes(filterBodyTypeDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllBodyTypesBasic(): Promise<ResponsePayload> {
    return await this.bodyTypeService.getAllBodyTypesBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getBodyTypeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.bodyTypeService.getBodyTypeById(id, select);
  }

  /**
   * updateBodyTypeById
   * updateMultipleBodyTypeById
   *
   * @param id
   * @param updateBodyTypeDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateBodyTypeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateBodyTypeDto: UpdateBodyTypeDto,
  ): Promise<ResponsePayload> {
    return await this.bodyTypeService.updateBodyTypeById(id, updateBodyTypeDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleBodyTypeById(@Body() updateBodyTypeDto: UpdateBodyTypeDto): Promise<ResponsePayload> {
    return await this.bodyTypeService.updateMultipleBodyTypeById(updateBodyTypeDto.ids, updateBodyTypeDto);
  }

  /**
   * deleteBodyTypeById
   * deleteMultipleBodyTypeById
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
  async deleteBodyTypeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.bodyTypeService.deleteBodyTypeById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleBodyTypeById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.bodyTypeService.deleteMultipleBodyTypeById(data.ids, Boolean(checkUsage));
  }
}
