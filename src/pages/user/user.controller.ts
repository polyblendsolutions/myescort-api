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
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { PASSPORT_USER_TOKEN_TYPE } from '../../core/global-variables';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { GetUser } from '../../decorator/get-user.decorator';
import { ChangePasswordDto } from '../../dto/change-password.dto';
import {
  AuthUserDto,
  CheckUserDto,
  CheckNewEmailDto,
  CheckUserRegistrationDto,
  CreateSocialUserDto,
  CreateUserDto,
  FilterAndPaginationUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserSelectFieldDto,
  UpdateUserSubscriptionPlanDto,
} from '../../dto/user.dto';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User, UserAuthResponse } from '../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('user')
export class UserController {
  private logger = new Logger(UserController.name);

  constructor(private usersService: UserService) {}

  /**
   * User Signup
   * User Login
   * User Signup & Login
   */

  @Post('/signup')
  @UsePipes(ValidationPipe)
  async userSignup(
    @Body()
    createUserDto: CreateUserDto,
  ): Promise<UserAuthResponse> {
    return await this.usersService.userSignup(createUserDto);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async userLogin(@Body() authUserDto: AuthUserDto): Promise<UserAuthResponse> {
    return await this.usersService.userLogin(authUserDto);
  }

  @Post('/signup-and-login')
  @UsePipes(ValidationPipe)
  async userSignupAndLogin(@Body() createUserDto: CreateUserDto): Promise<UserAuthResponse> {
    return await this.usersService.userSignupAndLogin(createUserDto);
  }

  @Post('/social-signup-and-login')
  @UsePipes(ValidationPipe)
  async userSignupAndLoginSocial(@Body() createUserDto: CreateSocialUserDto): Promise<UserAuthResponse> {
    return await this.usersService.userSignupAndLoginSocial(createUserDto);
  }

  @Post('/check-user-for-registration')
  @UsePipes(ValidationPipe)
  async checkUserForRegistration(
    @Body()
    checkUserRegistrationDto: CheckUserRegistrationDto,
  ): Promise<ResponsePayload> {
    return await this.usersService.checkUserForRegistration(checkUserRegistrationDto);
  }

  /**
   * Logged-in User Info
   *
   * @param userSelectFieldDto
   * @param user
   */
  @Version(VERSION_NEUTRAL)
  @Get('/logged-in-user-data')
  @UseGuards(AuthGuard(PASSPORT_USER_TOKEN_TYPE))
  async getLoggedInUserData(
    @Query(ValidationPipe) userSelectFieldDto: UserSelectFieldDto,
    @GetUser() user: User,
  ): Promise<ResponsePayload> {
    return this.usersService.getLoggedInUserData(user, userSelectFieldDto);
  }

  /**
   * User Subscription Info
   *
   * @param user
   */
  @Version(VERSION_NEUTRAL)
  @Get('/subscription-list')
  @UseGuards(AuthGuard(PASSPORT_USER_TOKEN_TYPE))
  async getUserSubscription(
    @GetUser() user: User,
  ): Promise<ResponsePayload> {
    return this.usersService.getUserSubscription(user);
  }

  /**
   * Get All Users (Not Recommended)
   * Get All Users V1 (Filter, Pagination, Select)
   * Get All Users V2 (Filter, Pagination, Select, Sort, Search Query)
   * Get All Users V3 (Filter, Pagination, Select, Sort, Search Query with Aggregation) ** Recommended
   * Get All Users by Search
   */

  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN, AdminRoles.EDITOR, AdminRoles.ACCOUNTANT)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getAllUsersV3(
    @Body() filterUserDto: FilterAndPaginationUserDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.usersService.getAllUsers(filterUserDto, searchString);
  }

  /**
   * Get User by ID
   * Update User by Id
   * Delete User by Id#
   * resetUserPassword()
   *
   * @param id
   * @param userSelectFieldDto
   */
  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN, AdminRoles.EDITOR)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getUserById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query(ValidationPipe) userSelectFieldDto: UserSelectFieldDto,
  ): Promise<ResponsePayload> {
    return await this.usersService.getUserById(id, userSelectFieldDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-logged-in-user')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_USER_TOKEN_TYPE))
  async updateLoggedInUserInfo(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<ResponsePayload> {
    return await this.usersService.updateLoggedInUserInfo(user, updateUserDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/change-logged-in-user-password')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_USER_TOKEN_TYPE))
  async changeLoggedInUserPassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ResponsePayload> {
    return await this.usersService.changeLoggedInUserPassword(user, changePasswordDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/reset-user-password')
  @UsePipes(ValidationPipe)
  async resetUserPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ResponsePayload> {
    return await this.usersService.resetUserPassword(resetPasswordDto);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/check-user-and-sent-otp')
  @UsePipes(ValidationPipe)
  async checkUserAndSentOtp(@Body() checkUserDto: CheckUserDto): Promise<ResponsePayload> {
    return await this.usersService.checkUserAndSentOtp(checkUserDto);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/check-new-email-and-sent-otp')
  @UsePipes(ValidationPipe)
  async checkNewEmailAndSentOtp(@Body() body: CheckNewEmailDto): Promise<ResponsePayload> {
    return await this.usersService.checkNewEmailAndSentOtp(body);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-data/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updateUserById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponsePayload> {
    return await this.usersService.updateUserById(id, updateUserDto);
  }
  @Version(VERSION_NEUTRAL)
  @Put('/update-data-user/:id')
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  // @UsePipes(ValidationPipe)
  async updateUserByIdUser(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponsePayload> {
    return await this.usersService.updateUserById(id, updateUserDto);
  }

  @Version(VERSION_NEUTRAL)
  @Delete('/delete-data/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteUserById(@Param('id', MongoIdValidationPipe) id: string): Promise<ResponsePayload> {
    return await this.usersService.deleteUserById(id);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple-data-by-id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleUserById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.usersService.deleteMultipleUserById(data.ids, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/activate-vip/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_USER_TOKEN_TYPE))
  async activateVIPBadge(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() data: UpdateUserSubscriptionPlanDto,
  ): Promise<ResponsePayload> {
    return await this.usersService.activateVipAndCreatePayment(id, data);
  }

  // @Version(VERSION_NEUTRAL)
  // @Post('/delete-multiple-data-by-id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.DELETE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  // async deleteMultipleTaskById(
  //   @Body() data: { ids: string[] },
  //   @Query('checkUsage') checkUsage: boolean,
  // ): Promise<ResponsePayload> {
  //   return await this.usersService.deleteMultipleUserById(
  //     data.ids,
  //     Boolean(checkUsage),
  //   );
  // }
}
