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

import { BannerCaroselService } from './banner-carosel.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../../decorator/get-token-user.decorator';
import {
  AddBannerCaroselDto,
  CheckBannerCaroselDto,
  FilterAndPaginationBannerCaroselDto,
  OptionBannerCaroselDto,
  UpdateBannerCaroselDto,
} from '../../../dto/banner-carosel.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { User } from '../../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('banner-carousel')
export class BannerCaroselController {
  private logger = new Logger(BannerCaroselController.name);

  constructor(private bannerCaroselService: BannerCaroselService) {}

  /**
   * addBannerCarosel
   * insertManyBannerCarosel
   *
   * @param addBannerCaroselDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addBannerCarosel(
    @Body()
    addBannerCaroselDto: AddBannerCaroselDto,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.addBannerCarosel(addBannerCaroselDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyBannerCarosel(
    @Body()
    body: {
      data: AddBannerCaroselDto[];
      option: OptionBannerCaroselDto;
    },
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.insertManyBannerCarosel(body.data, body.option);
  }

  /**
   * getAllBannerCarosels
   * getBannerCaroselById
   *
   * @param filterBannerCaroselDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllBannerCarosels(
    @Body() filterBannerCaroselDto: FilterAndPaginationBannerCaroselDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.bannerCaroselService.getAllBannerCarosels(filterBannerCaroselDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllBannerCaroselsBasic(): Promise<ResponsePayload> {
    return await this.bannerCaroselService.getAllBannerCaroselsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getBannerCaroselById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.getBannerCaroselById(id, select);
  }

  /**
   * updateBannerCaroselById
   * updateMultipleBannerCaroselById
   *
   * @param id
   * @param updateBannerCaroselDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateBannerCaroselById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateBannerCaroselDto: UpdateBannerCaroselDto,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.updateBannerCaroselById(id, updateBannerCaroselDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleBannerCaroselById(
    @Body() updateBannerCaroselDto: UpdateBannerCaroselDto,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.updateMultipleBannerCaroselById(
      updateBannerCaroselDto.ids,
      updateBannerCaroselDto,
    );
  }

  /**
   * deleteBannerCaroselById
   * deleteMultipleBannerCaroselById
   *
   * @param id
   * @param checkUsage
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteBannerCaroselById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.deleteBannerCaroselById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleBannerCaroselById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.deleteMultipleBannerCaroselById(data.ids, Boolean(checkUsage));
  }

  @Post('/check-bannerCarosel-availability')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async checkBannerCaroselAvailability(
    @GetTokenUser() user: User,
    @Body() checkBannerCaroselDto: CheckBannerCaroselDto,
  ): Promise<ResponsePayload> {
    return await this.bannerCaroselService.checkBannerCaroselAvailability(user, checkBannerCaroselDto);
  }
}
