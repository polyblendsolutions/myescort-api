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

import { PromoOfferService } from './promo-offer.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import {
  AddPromoOfferDto,
  FilterAndPaginationPromoOfferDto,
  OptionPromoOfferDto,
  UpdatePromoOfferDto,
} from '../../../dto/promo-offer.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('promo-offer')
export class PromoOfferController {
  private logger = new Logger(PromoOfferController.name);

  constructor(private promoOfferService: PromoOfferService) {}

  /**
   * addPromoOffer
   * insertManyPromoOffer
   *
   * @param addPromoOfferDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addPromoOffer(
    @Body()
    addPromoOfferDto: AddPromoOfferDto,
  ): Promise<ResponsePayload> {
    return await this.promoOfferService.addPromoOffer(addPromoOfferDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyPromoOffer(
    @Body()
    body: {
      data: AddPromoOfferDto[];
      option: OptionPromoOfferDto;
    },
  ): Promise<ResponsePayload> {
    return await this.promoOfferService.insertManyPromoOffer(body.data, body.option);
  }

  /**
   * getAllPromoOffers
   * getPromoOfferById
   *
   * @param filterPromoOfferDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllPromoOffers(
    @Body() filterPromoOfferDto: FilterAndPaginationPromoOfferDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.promoOfferService.getAllPromoOffers(filterPromoOfferDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/promotional-offer')
  async getPromoOfferSingle(@Query() select: string): Promise<ResponsePayload> {
    return await this.promoOfferService.getPromoOfferSingle(select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getPromoOfferById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.promoOfferService.getPromoOfferById(id, select);
  }

  /**
   * updatePromoOfferById
   * updateMultiplePromoOfferById
   *
   * @param id
   * @param updatePromoOfferDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updatePromoOfferById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updatePromoOfferDto: UpdatePromoOfferDto,
  ): Promise<ResponsePayload> {
    return await this.promoOfferService.updatePromoOfferById(id, updatePromoOfferDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultiplePromoOfferById(@Body() updatePromoOfferDto: UpdatePromoOfferDto): Promise<ResponsePayload> {
    return await this.promoOfferService.updateMultiplePromoOfferById(updatePromoOfferDto.ids, updatePromoOfferDto);
  }

  /**
   * deletePromoOfferById
   * deleteMultiplePromoOfferById
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
  async deletePromoOfferById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.promoOfferService.deletePromoOfferById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultiplePromoOfferById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.promoOfferService.deleteMultiplePromoOfferById(data.ids, Boolean(checkUsage));
  }
}
