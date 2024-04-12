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

import { NewsletterService } from './newsletter.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../../decorator/get-token-user.decorator';
import {
  AddNewsletterDto,
  FilterAndPaginationNewsletterDto,
  OptionNewsletterDto,
  UpdateNewsletterDto,
} from '../../../dto/newsletter.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { User } from '../../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('newsletter')
export class NewsletterController {
  private logger = new Logger(NewsletterController.name);

  constructor(private newsletterService: NewsletterService) {}

  /**
   * addNewsletter
   * insertManyNewsletter
   *
   * @param addNewsletterDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addNewsletter(
    @Body()
    addNewsletterDto: AddNewsletterDto,
  ): Promise<ResponsePayload> {
    return await this.newsletterService.addNewsletter(addNewsletterDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyNewsletter(
    @Body()
    body: {
      data: AddNewsletterDto[];
      option: OptionNewsletterDto;
    },
  ): Promise<ResponsePayload> {
    return await this.newsletterService.insertManyNewsletter(body.data, body.option);
  }

  /**
   * getAllNewsletters
   * getNewsletterById
   *
   * @param filterNewsletterDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllNewsletters(
    @Body() filterNewsletterDto: FilterAndPaginationNewsletterDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.newsletterService.getAllNewsletters(filterNewsletterDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllNewslettersBasic(): Promise<ResponsePayload> {
    return await this.newsletterService.getAllNewslettersBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getNewsletterById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.newsletterService.getNewsletterById(id, select);
  }

  /**
   * updateNewsletterById
   * updateMultipleNewsletterById
   *
   * @param id
   * @param updateNewsletterDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateNewsletterById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateNewsletterDto: UpdateNewsletterDto,
  ): Promise<ResponsePayload> {
    return await this.newsletterService.updateNewsletterById(id, updateNewsletterDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleNewsletterById(@Body() updateNewsletterDto: UpdateNewsletterDto): Promise<ResponsePayload> {
    return await this.newsletterService.updateMultipleNewsletterById(updateNewsletterDto.ids, updateNewsletterDto);
  }

  /**
   * deleteNewsletterById
   * deleteMultipleNewsletterById
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
  async deleteNewsletterById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.newsletterService.deleteNewsletterById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleNewsletterById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.newsletterService.deleteMultipleNewsletterById(data.ids, Boolean(checkUsage));
  }
}
