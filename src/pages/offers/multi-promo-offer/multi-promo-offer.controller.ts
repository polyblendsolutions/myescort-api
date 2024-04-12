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

import { MultiPromoOfferService } from './multi-promo-offer.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import {
  AddMultiPromoOfferDto,
  FilterAndPaginationMultiPromoOfferDto,
  OptionMultiPromoOfferDto,
  UpdateMultiPromoOfferDto,
} from '../../../dto/multi-promo-offer.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('multi-promo-offer')
export class MultiPromoOfferController {
  private logger = new Logger(MultiPromoOfferController.name);

  constructor(private multiPromoOfferService: MultiPromoOfferService) {}

  /**
   * addMultiPromoOffer
   * insertManyMultiPromoOffer
   *
   * @param addMultiPromoOfferDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addMultiPromoOffer(
    @Body()
    addMultiPromoOfferDto: AddMultiPromoOfferDto,
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.addMultiPromoOffer(addMultiPromoOfferDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyMultiPromoOffer(
    @Body()
    body: {
      data: AddMultiPromoOfferDto[];
      option: OptionMultiPromoOfferDto;
    },
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.insertManyMultiPromoOffer(body.data, body.option);
  }

  /**
   * getAllMultiPromoOffers
   * getMultiPromoOfferById
   *
   * @param filterMultiPromoOfferDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllMultiPromoOffers(
    @Body() filterMultiPromoOfferDto: FilterAndPaginationMultiPromoOfferDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.multiPromoOfferService.getAllMultiPromoOffers(filterMultiPromoOfferDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/multi-promotional-offer')
  async getMultiPromoOfferSingle(@Query() select: string): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.getMultiPromoOfferDouble(select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async getMultiPromoOfferById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.getMultiPromoOfferById(id, select);
  }

  /**
   * updateMultiPromoOfferById
   * updateMultipleMultiPromoOfferById
   *
   * @param id
   * @param updateMultiPromoOfferDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultiPromoOfferById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateMultiPromoOfferDto: UpdateMultiPromoOfferDto,
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.updateMultiPromoOfferById(id, updateMultiPromoOfferDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleMultiPromoOfferById(
    @Body() updateMultiPromoOfferDto: UpdateMultiPromoOfferDto,
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.updateMultipleMultiPromoOfferById(
      updateMultiPromoOfferDto.ids,
      updateMultiPromoOfferDto,
    );
  }

  /**
   * deleteMultiPromoOfferById
   * deleteMultipleMultiPromoOfferById
   *
   * @param id
   * @param checkUsage
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteMultiPromoOfferById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.deleteMultiPromoOfferById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleMultiPromoOfferById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.multiPromoOfferService.deleteMultipleMultiPromoOfferById(data.ids, Boolean(checkUsage));
  }
}
