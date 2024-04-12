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
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';

import { VerifiedService } from './verified.service';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { GetUser } from '../../decorator/get-user.decorator';
import { FilterAndPaginationProductDto, GetProductByIdsDto } from '../../dto/product.dto';
import {
  AddVerifiedDto,
  FilterAndPaginationVerifiedDto,
  GetVerifiedByIdsDto,
  OptionVerifiedDto,
  UpdateVerifiedDto,
} from '../../dto/verified.dto';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('verified')
export class VerifiedController {
  private logger = new Logger(VerifiedController.name);

  constructor(private verifiedService: VerifiedService) {}

  /**
   * addVerified
   * insertManyVerified
   *
   * @param user
   * @param addVerifiedDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @UseGuards(UserJwtAuthGuard)
  async addVerified(
    @GetUser() user: User,
    @Body()
    addVerifiedDto: AddVerifiedDto,
  ): Promise<ResponsePayload> {
    return await this.verifiedService.addVerified(user, addVerifiedDto);
  }

  @Post('/add-by-admin')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async adddVerifiedByAdmin(
    @GetAdmin() admin: Admin,
    @Body()
    addVerifiedDto: AddVerifiedDto,
  ): Promise<ResponsePayload> {
    return await this.verifiedService.addVerifiedByAdmin(admin, addVerifiedDto);
  }

  /**
   * getAllVerifieds
   * getVerifiedById
   */

  @Version(VERSION_NEUTRAL)
  @Post('/get-all-verified')
  // @UsePipes(ValidationPipe)
  async getAllVerifieds(): Promise<ResponsePayload> {
    return this.verifiedService.getAllVerifieds();
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-all-verified-by-query')
  // @UsePipes(ValidationPipe)
  async getAllVerifiedsByQuery(
    @Body() filterVerifiedDto: FilterAndPaginationVerifiedDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.verifiedService.getAllVerifiedsByQuery(filterVerifiedDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getVerifiedById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.verifiedService.getVerifiedById(id, select);
  }

  /**
   * updateVerifiedById
   * updateMultipleVerifiedById
   *
   * @param id
   * @param updateVerifiedDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateVerifiedById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateVerifiedDto: UpdateVerifiedDto,
  ): Promise<ResponsePayload> {
    console.log('updateVerifiedDto', updateVerifiedDto);
    return await this.verifiedService.updateVerifiedById(id, updateVerifiedDto);
  }

  /**
   * deleteVerifiedById
   * deleteMultipleVerifiedById
   *
   * @param id
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async deleteVerifiedById(@Param('id', MongoIdValidationPipe) id: string): Promise<ResponsePayload> {
    return await this.verifiedService.deleteVerifiedById(id);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleBlogById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.verifiedService.deleteMultipleVerifiedById(data.ids, Boolean(checkUsage));
  }
}
