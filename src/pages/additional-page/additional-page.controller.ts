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

import { AdditionalPageService } from './additional-page.service';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AddAdditionalPageDto, UpdateAdditionalPageDto } from '../../dto/additional-page.dto';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('additional-page')
export class AdditionalPageController {
  private logger = new Logger(AdditionalPageController.name);

  constructor(private additionalPageService: AdditionalPageService) {}

  /**
   * addAdditionalPage
   * insertManyAdditionalPage
   *
   * @param addAdditionalPageDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addAdditionalPage(
    @Body()
    addAdditionalPageDto: AddAdditionalPageDto,
  ): Promise<ResponsePayload> {
    return await this.additionalPageService.addAdditionalPage(addAdditionalPageDto);
  }

  /**
   * getAllAdditionalPages
   * getAdditionalPageById
   */

  @Version(VERSION_NEUTRAL)
  @Get('/:slug')
  async getAdditionalPageById(@Param('slug') slug: string, @Query() select: string): Promise<ResponsePayload> {
    return await this.additionalPageService.getAdditionalPageBySlug(slug, select);
  }

  /**
   * updateAdditionalPageById
   * updateMultipleAdditionalPageById
   *
   * @param slug
   * @param updateAdditionalPageDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update-data/:slug')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateAdditionalPageById(
    @Param('slug', MongoIdValidationPipe) slug: string,
    @Body() updateAdditionalPageDto: UpdateAdditionalPageDto,
  ): Promise<ResponsePayload> {
    return await this.additionalPageService.updateAdditionalPageBySlug(slug, updateAdditionalPageDto);
  }

  /**
   * deleteAdditionalPageById
   * deleteMultipleAdditionalPageById
   *
   * @param slug
   * @param checkUsage
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete-data/:slug')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteAdditionalPageById(
    @Param('slug', MongoIdValidationPipe) slug: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.additionalPageService.deleteAdditionalPageBySlug(slug, Boolean(checkUsage));
  }
}
