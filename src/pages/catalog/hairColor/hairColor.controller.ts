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

import { HairColorService } from './hairColor.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import {
  AddHairColorDto,
  FilterAndPaginationHairColorDto,
  OptionHairColorDto,
  UpdateHairColorDto,
} from '../../../dto/hairColor.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('hairColor')
export class HairColorController {
  private logger = new Logger(HairColorController.name);

  constructor(private hairColorService: HairColorService) {}

  /**
   * addHairColor
   * insertManyHairColor
   *
   * @param addHairColorDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addHairColor(
    @Body()
    addHairColorDto: AddHairColorDto,
  ): Promise<ResponsePayload> {
    return await this.hairColorService.addHairColor(addHairColorDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyHairColor(
    @Body()
    body: {
      data: AddHairColorDto[];
      option: OptionHairColorDto;
    },
  ): Promise<ResponsePayload> {
    return await this.hairColorService.insertManyHairColor(body.data, body.option);
  }

  /**
   * getAllHairColors
   * getHairColorById
   *
   * @param filterHairColorDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllHairColors(
    @Body() filterHairColorDto: FilterAndPaginationHairColorDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.hairColorService.getAllHairColors(filterHairColorDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllHairColorsBasic(): Promise<ResponsePayload> {
    return await this.hairColorService.getAllHairColorsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getHairColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.hairColorService.getHairColorById(id, select);
  }

  /**
   * updateHairColorById
   * updateMultipleHairColorById
   *
   * @param id
   * @param updateHairColorDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateHairColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateHairColorDto: UpdateHairColorDto,
  ): Promise<ResponsePayload> {
    return await this.hairColorService.updateHairColorById(id, updateHairColorDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleHairColorById(@Body() updateHairColorDto: UpdateHairColorDto): Promise<ResponsePayload> {
    return await this.hairColorService.updateMultipleHairColorById(updateHairColorDto.ids, updateHairColorDto);
  }

  /**
   * deleteHairColorById
   * deleteMultipleHairColorById
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
  async deleteHairColorById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.hairColorService.deleteHairColorById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleHairColorById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.hairColorService.deleteMultipleHairColorById(data.ids, Boolean(checkUsage));
  }
}
