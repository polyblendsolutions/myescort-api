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

import { ProductService } from './product.service';
import { AdminMetaPermissions } from '../../decorator/admin-permissions.decorator';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { GetTokenUser } from '../../decorator/get-token-user.decorator';
import {
  AddProductDto,
  FilterAndPaginationProductDto,
  GetProductByIdsDto,
  OptionProductDto,
  UpdateProductDto,
} from '../../dto/product.dto';
import { AdminPermissions } from '../../enum/admin-permission.enum';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../guards/admin-permission.guard';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { UserJwtAuthGuard } from '../../guards/user-jwt-auth.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User } from '../../interfaces/user/user.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';

@Controller('product')
export class ProductController {
  private logger = new Logger(ProductController.name);

  constructor(private productService: ProductService) {}

  /**
   * addProduct
   * insertManyProduct
   *
   * @param addProductDto
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async addProduct(
    @Body()
    addProductDto: AddProductDto,
  ): Promise<ResponsePayload> {
    return await this.productService.addProduct(addProductDto);
  }

  @Post('/add-by-user')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async addProductByUser(
    @GetTokenUser() user: User,
    @Body()
    addProductDto: AddProductDto,
  ): Promise<ResponsePayload> {
    return await this.productService.addProductByUser(user, addProductDto);
  }

  @Post('/clone')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async cloneSingleProduct(
    @Body('id')
    id: string,
  ): Promise<ResponsePayload> {
    return await this.productService.cloneSingleProduct(id);
  }

  @Post('/insert-many')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.CREATE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async insertManyProduct(
    @Body()
    body: {
      data: AddProductDto[];
      option: OptionProductDto;
    },
  ): Promise<ResponsePayload> {
    return await this.productService.insertManyProduct(body.data, body.option);
  }

  /**
   * getAllProducts
   * getProductById
   *
   * @param filterProductDto
   * @param searchString
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  async getAllProducts(
    @Body() filterProductDto: FilterAndPaginationProductDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.productService.getAllProducts(filterProductDto, searchString);
  }

  /**
   * getAllProducts
   * getProductById
   */
  @Version(VERSION_NEUTRAL)
  @Post('/admin-get-all')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  @UsePipes(ValidationPipe)
  async getAdminAllProducts(
    @Body() filterProductDto: FilterAndPaginationProductDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    return this.productService.getAllAdminProducts(filterProductDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-all-by-user')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async getAllUserProducts(
    @GetTokenUser() user: User,
    @Body() filterProductDto: FilterAndPaginationProductDto,
    @Query('q') searchString: string,
  ): Promise<ResponsePayload> {
    const filter = filterProductDto.filter;
    filterProductDto.filter = { ...filter, ...{ 'user._id': user._id } };
    return this.productService.getAllProducts(filterProductDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/get-products-by-ids')
  async getProductByIds(
    @Body() getProductByIdsDto: GetProductByIdsDto,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productService.getProductByIds(getProductByIdsDto, select);
  }

  //TODO: @Param('id') shortId: string validation pipe needs to be added here for short id validation.
  @Version(VERSION_NEUTRAL)
  @Get('/short/:id')
  async getProductByShortId(
    @Param('id') shortId: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productService.getProductByShortId(shortId, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  async getProductById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
  ): Promise<ResponsePayload> {
    return await this.productService.getProductById(id, select);
  }

  /**
   * updateProductById
   * updateMultipleProductById
   */

  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateProductById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    return await this.productService.updateProductById(id, updateProductDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-by-user/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async updateUserProductById(
    @GetTokenUser() user: User,
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    return await this.productService.updateUserProductById(user, id, updateProductDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.EDIT)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleProductById(@Body() updateProductDto: UpdateProductDto): Promise<ResponsePayload> {
    return await this.productService.updateMultipleProductById(updateProductDto.ids, updateProductDto);
  }

  /**
   * deleteProductById
   * deleteMultipleProductById
   *
   * @param id
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteProductById(@Param('id', MongoIdValidationPipe) id: string, @GetTokenUser() user: User): Promise<ResponsePayload> {
    return await this.productService.deleteProductById(id, user?._id);
  }

  @Version(VERSION_NEUTRAL)
  @Delete('/delete-by-user/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(UserJwtAuthGuard)
  async deleteUserProductById(
    @GetTokenUser() user: User,
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<ResponsePayload> {
    return await this.productService.deleteUserProductById(user, id);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
  @UseGuards(AdminRolesGuard)
  @AdminMetaPermissions(AdminPermissions.DELETE)
  @UseGuards(AdminPermissionGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleProductById(@Body() data: { ids: string[] }): Promise<ResponsePayload> {
    return await this.productService.deleteMultipleProductById(data.ids);
  }

  @Version(VERSION_NEUTRAL)
  @Post('/set-product-not-null')
  async setProductQtyNotNull(): Promise<ResponsePayload> {
    return await this.productService.setProductQtyNotNull();
  }

  @Version(VERSION_NEUTRAL)
  @Post('/set-product-image-https')
  async setProductImageHttpToHttps(): Promise<ResponsePayload> {
    return await this.productService.setProductImageHttpToHttps();
  }

  @Version(VERSION_NEUTRAL)
  @Post('/:slug')
  async getProductBySlug(@Param('slug') slug: string, @Query() select: string): Promise<ResponsePayload> {
    return await this.productService.getProductBySlug(slug, select);
  }
}
