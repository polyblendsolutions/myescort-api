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

import { TypeService } from './type.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { AddTypeDto, FilterAndPaginationTypeDto, OptionTypeDto, UpdateTypeDto } from '../../../dto/type.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('type')
export class TypeController {
  private logger = new Logger(TypeController.name);

  constructor(private typeService: TypeService) {}

  /**
   * addType
   * insertManyType
   *
   * @param addTypeDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addType(
    @Body()
    addTypeDto: AddTypeDto,
  ): Promise<ResponsePayload> {
    return await this.typeService.addType(addTypeDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyType(
    @Body()
    body: {
      data: AddTypeDto[];
      option: OptionTypeDto;
    },
  ): Promise<ResponsePayload> {
    return await this.typeService.insertManyType(body.data, body.option);
  }

  /**
   * getAllTypes
   * getTypeById
   *
   * @param filterTypeDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllTypes(
    @Body() filterTypeDto: FilterAndPaginationTypeDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.typeService.getAllTypes(filterTypeDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllTypesBasic(): Promise<ResponsePayload> {
    return await this.typeService.getAllTypesBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getTypeById(@Param('id', MongoIdValidationPipe) id: string, @Query() select: string): Promise<ResponsePayload> {
    return await this.typeService.getTypeById(id, select);
  }

  /**
   * updateTypeById
   * updateMultipleTypeById
   *
   * @param id
   * @param updateTypeDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateTypeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateTypeDto: UpdateTypeDto,
  ): Promise<ResponsePayload> {
    return await this.typeService.updateTypeById(id, updateTypeDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleTypeById(@Body() updateTypeDto: UpdateTypeDto): Promise<ResponsePayload> {
    return await this.typeService.updateMultipleTypeById(updateTypeDto.ids, updateTypeDto);
  }

  /**
   * deleteTypeById
   * deleteMultipleTypeById
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
  async deleteTypeById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.typeService.deleteTypeById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleTypeById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.typeService.deleteMultipleTypeById(data.ids, Boolean(checkUsage));
  }
}
