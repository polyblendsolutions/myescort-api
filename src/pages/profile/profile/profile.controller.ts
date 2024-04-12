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

import { ProfileService } from './profile.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../../decorator/get-token-user.decorator';
import {
  AddProfileDto,
  CheckProfileDto,
  FilterAndPaginationProfileDto,
  OptionProfileDto,
  UpdateProfileDto,
} from '../../../dto/profile.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { User } from '../../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('profile')
export class ProfileController {
  private logger = new Logger(ProfileController.name);

  constructor(private profileService: ProfileService) {}

  /**
   * addProfile
   * insertManyProfile
   *
   * @param addProfileDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addProfile(
    @Body()
    addProfileDto: AddProfileDto,
  ): Promise<ResponsePayload> {
    return await this.profileService.addProfile(addProfileDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyProfile(
    @Body()
    body: {
      data: AddProfileDto[];
      option: OptionProfileDto;
    },
  ): Promise<ResponsePayload> {
    return await this.profileService.insertManyProfile(body.data, body.option);
  }

  /**
   * getAllProfiles
   * getProfileById
   *
   * @param filterProfileDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProfiles(
    @Body() filterProfileDto: FilterAndPaginationProfileDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.profileService.getAllProfiles(filterProfileDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllProfilesBasic(): Promise<ResponsePayload> {
    return await this.profileService.getAllProfilesBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getProfileById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.profileService.getProfileById(id, select);
  }

  /**
   * updateProfileById
   * updateMultipleProfileById
   *
   * @param id
   * @param updateProfileDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateProfileById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ResponsePayload> {
    return await this.profileService.updateProfileById(id, updateProfileDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleProfileById(@Body() updateProfileDto: UpdateProfileDto): Promise<ResponsePayload> {
    return await this.profileService.updateMultipleProfileById(updateProfileDto.ids, updateProfileDto);
  }

  /**
   * deleteProfileById
   * deleteMultipleProfileById
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
  async deleteProfileById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.profileService.deleteProfileById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleProfileById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.profileService.deleteMultipleProfileById(data.ids, Boolean(checkUsage));
  }

  @Post('/check-profile-availability')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async checkProfileAvailability(
    @GetTokenUser() user: User,
    @Body() checkProfileDto: CheckProfileDto,
  ): Promise<ResponsePayload> {
    return await this.profileService.checkProfileAvailability(user, checkProfileDto);
  }
}
