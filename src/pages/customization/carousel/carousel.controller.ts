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

import { CarouselService } from './carousel.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../../decorator/get-token-user.decorator';
import {
  AddCarouselDto,
  CheckCarouselDto,
  FilterAndPaginationCarouselDto,
  OptionCarouselDto,
  UpdateCarouselDto,
} from '../../../dto/carousel.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { User } from '../../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('carousel')
export class CarouselController {
  private logger = new Logger(CarouselController.name);

  constructor(private carouselService: CarouselService) {}

  /**
   * addCarousel
   * insertManyCarousel
   *
   * @param addCarouselDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addCarousel(
    @Body()
    addCarouselDto: AddCarouselDto,
  ): Promise<ResponsePayload> {
    return await this.carouselService.addCarousel(addCarouselDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyCarousel(
    @Body()
    body: {
      data: AddCarouselDto[];
      option: OptionCarouselDto;
    },
  ): Promise<ResponsePayload> {
    return await this.carouselService.insertManyCarousel(body.data, body.option);
  }

  /**
   * getAllCarousels
   * getCarouselById
   *
   * @param filterCarouselDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllCarousels(
    @Body() filterCarouselDto: FilterAndPaginationCarouselDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.carouselService.getAllCarousels(filterCarouselDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllCarouselsBasic(): Promise<ResponsePayload> {
    return await this.carouselService.getAllCarouselsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getCarouselById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.carouselService.getCarouselById(id, select);
  }

  /**
   * updateCarouselById
   * updateMultipleCarouselById
   *
   * @param id
   * @param updateCarouselDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateCarouselById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateCarouselDto: UpdateCarouselDto,
  ): Promise<ResponsePayload> {
    return await this.carouselService.updateCarouselById(id, updateCarouselDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleCarouselById(@Body() updateCarouselDto: UpdateCarouselDto): Promise<ResponsePayload> {
    return await this.carouselService.updateMultipleCarouselById(updateCarouselDto.ids, updateCarouselDto);
  }

  /**
   * deleteCarouselById
   * deleteMultipleCarouselById
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
  async deleteCarouselById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.carouselService.deleteCarouselById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleCarouselById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.carouselService.deleteMultipleCarouselById(data.ids, Boolean(checkUsage));
  }

  // TODO: Rename to check-carousel-availability
  @Post('/check-contact-availability')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async checkCarouselAvailability(
    @GetTokenUser() user: User,
    @Body() checkCarouselDto: CheckCarouselDto,
  ): Promise<ResponsePayload> {
    return await this.carouselService.checkCarouselAvailability(user, checkCarouselDto);
  }
}
