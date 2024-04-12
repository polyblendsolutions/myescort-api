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

import { BlogService } from './blog.service';
import { AdminMetaPermissions } from '../../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../../decorator/get-token-user.decorator';
import {
  AddBlogDto,
  CheckBlogDto,
  FilterAndPaginationBlogDto,
  OptionBlogDto,
  UpdateBlogDto,
} from '../../../dto/blog.dto';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { AdminRoles } from '../../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../../interfaces/core/response-payload.interface';
import { User } from '../../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../../pipes/mongo-id-validation.pipe';

@Controller('blog')
export class BlogController {
  private logger = new Logger(BlogController.name);

  constructor(private blogService: BlogService) {}

  /**
   * addBlog
   * insertManyBlog
   *
   * @param addBlogDto
   */
  @Post('/add')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.CREATE)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async addBlog(
    @Body()
    addBlogDto: AddBlogDto,
  ): Promise<ResponsePayload> {
    return await this.blogService.addBlog(addBlogDto);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyBlog(
    @Body()
    body: {
      data: AddBlogDto[];
      option: OptionBlogDto;
    },
  ): Promise<ResponsePayload> {
    return await this.blogService.insertManyBlog(body.data, body.option);
  }

  /**
   * getAllBlogs
   * getBlogById
   *
   * @param filterBlogDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllBlogs(
    @Body() filterBlogDto: FilterAndPaginationBlogDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.blogService.getAllBlogs(filterBlogDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-all-basic')
  async getAllBlogsBasic(): Promise<ResponsePayload> {
    return await this.blogService.getAllBlogsBasic();
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getBlogById(@Param('id', MongoIdValidationPipe) id: string, @Query() select: string): Promise<ResponsePayload> {
    return await this.blogService.getBlogById(id, select);
  }

  /**
   * updateBlogById
   * updateMultipleBlogById
   *
   * @param id
   * @param updateBlogDto
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  // @UsePipes(ValidationPipe)
  // @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  // @UseGuards(AdminRolesGuard)
  // @AdminMetaPermissions(AdminPermissions.EDIT)
  // @UseGuards(AdminPermissionGuard)
  // @UseGuards(AdminJwtAuthGuard)
  async updateBlogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<ResponsePayload> {
    return await this.blogService.updateBlogById(id, updateBlogDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleBlogById(@Body() updateBlogDto: UpdateBlogDto): Promise<ResponsePayload> {
    return await this.blogService.updateMultipleBlogById(updateBlogDto.ids, updateBlogDto);
  }

  /**
   * deleteBlogById
   * deleteMultipleBlogById
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
  async deleteBlogById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.blogService.deleteBlogById(id, Boolean(checkUsage));
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
    return await this.blogService.deleteMultipleBlogById(data.ids, Boolean(checkUsage));
  }

  @Post('/check-profile-availability')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async checkBlogAvailability(
    @GetTokenUser() user: User,
    @Body() checkBlogDto: CheckBlogDto,
  ): Promise<ResponsePayload> {
    return await this.blogService.checkBlogAvailability(user, checkBlogDto);
  }
}
