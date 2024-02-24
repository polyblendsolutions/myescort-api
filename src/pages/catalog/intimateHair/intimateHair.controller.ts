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
import {AdminMetaRoles} from '../../../decorator/admin-roles.decorator';
import {AdminRoles} from '../../../enum/admin-roles.enum';
import {AdminRolesGuard} from '../../../guards/admin-roles.guard';
import {AdminMetaPermissions} from '../../../decorator/admin-permissions.decorator';
import {AdminPermissions} from '../../../enum/admin-permission.enum';
import {AdminPermissionGuard} from '../../../guards/admin-permission.guard';
import {AdminJwtAuthGuard} from '../../../guards/admin-jwt-auth.guard';
import {
    AddIntimateHairDto,
    FilterAndPaginationIntimateHairDto,
    OptionIntimateHairDto,
    UpdateIntimateHairDto,
} from '../../../dto/intimateHair.dto';
import {ResponsePayload} from '../../../interfaces/core/response-payload.interface';
import {MongoIdValidationPipe} from '../../../pipes/mongo-id-validation.pipe';
import {IntimateHairService} from './intimateHair.service';

@Controller('intimateHair')
export class IntimateHairController {
    private logger = new Logger(IntimateHairController.name);

    constructor(private intimateHairService: IntimateHairService) {
    }

    /**
     * addIntimateHair
     * insertManyIntimateHair
     */
    @Post('/add')
    @UsePipes(ValidationPipe)
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
    @UseGuards(AdminRolesGuard)
    @AdminMetaPermissions(AdminPermissions.CREATE)
    @UseGuards(AdminPermissionGuard)
    @UseGuards(AdminJwtAuthGuard)
    async addIntimateHair(
        @Body()
            addIntimateHairDto: AddIntimateHairDto,
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.addIntimateHair(addIntimateHairDto);
    }

    @Post('/insert-many')
    @UsePipes(ValidationPipe)
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
    @UseGuards(AdminRolesGuard)
    @AdminMetaPermissions(AdminPermissions.CREATE)
    @UseGuards(AdminPermissionGuard)
    @UseGuards(AdminJwtAuthGuard)
    async insertManyIntimateHair(
        @Body()
            body: {
            data: AddIntimateHairDto[];
            option: OptionIntimateHairDto;
        },
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.insertManyIntimateHair(body.data, body.option);
    }

    /**
     * getAllIntimateHairs
     * getIntimateHairById
     */
    @Version(VERSION_NEUTRAL)
    @Post('/get-all')
    @UsePipes(ValidationPipe)
    async getAllIntimateHairs(
        @Body() filterIntimateHairDto: FilterAndPaginationIntimateHairDto,
        @Query('q') searchString: string,
    ): Promise<ResponsePayload> {
        return this.intimateHairService.getAllIntimateHairs(filterIntimateHairDto, searchString);
    }

    @Version(VERSION_NEUTRAL)
    @Get('/get-all-basic')
    async getAllIntimateHairsBasic(): Promise<ResponsePayload> {
        return await this.intimateHairService.getAllIntimateHairsBasic();
    }

    @Version(VERSION_NEUTRAL)
    @Get('/:id')
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
    @UseGuards(AdminRolesGuard)
    @UseGuards(AdminJwtAuthGuard)
    async getIntimateHairById(
        @Param('id', MongoIdValidationPipe) id: string,
        @Query() select: string,
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.getIntimateHairById(id, select);
    }

    /**
     * updateIntimateHairById
     * updateMultipleIntimateHairById
     */
    @Version(VERSION_NEUTRAL)
    @Put('/update/:id')
    @UsePipes(ValidationPipe)
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
    @UseGuards(AdminRolesGuard)
    @AdminMetaPermissions(AdminPermissions.EDIT)
    @UseGuards(AdminPermissionGuard)
    @UseGuards(AdminJwtAuthGuard)
    async updateIntimateHairById(
        @Param('id', MongoIdValidationPipe) id: string,
        @Body() updateIntimateHairDto: UpdateIntimateHairDto,
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.updateIntimateHairById(id, updateIntimateHairDto);
    }

    @Version(VERSION_NEUTRAL)
    @Put('/update-multiple')
    @UsePipes(ValidationPipe)
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
    @UseGuards(AdminRolesGuard)
    @AdminMetaPermissions(AdminPermissions.EDIT)
    @UseGuards(AdminPermissionGuard)
    @UseGuards(AdminJwtAuthGuard)
    async updateMultipleIntimateHairById(
        @Body() updateIntimateHairDto: UpdateIntimateHairDto,
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.updateMultipleIntimateHairById(
            updateIntimateHairDto.ids,
            updateIntimateHairDto,
        );
    }

    /**
     * deleteIntimateHairById
     * deleteMultipleIntimateHairById
     */
    @Version(VERSION_NEUTRAL)
    @Delete('/delete/:id')
    @UsePipes(ValidationPipe)
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
    @UseGuards(AdminRolesGuard)
    @AdminMetaPermissions(AdminPermissions.DELETE)
    @UseGuards(AdminPermissionGuard)
    @UseGuards(AdminJwtAuthGuard)
    async deleteIntimateHairById(
        @Param('id', MongoIdValidationPipe) id: string,
        @Query('checkUsage') checkUsage: boolean,
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.deleteIntimateHairById(id, Boolean(checkUsage));
    }

    @Version(VERSION_NEUTRAL)
    @Post('/delete-multiple')
    @UsePipes(ValidationPipe)
    @AdminMetaRoles(AdminRoles.SUPER_ADMIN)
    @UseGuards(AdminRolesGuard)
    @AdminMetaPermissions(AdminPermissions.DELETE)
    @UseGuards(AdminPermissionGuard)
    @UseGuards(AdminJwtAuthGuard)
    async deleteMultipleIntimateHairById(
        @Body() data: { ids: string[] },
        @Query('checkUsage') checkUsage: boolean,
    ): Promise<ResponsePayload> {
        return await this.intimateHairService.deleteMultipleIntimateHairById(
            data.ids,
            Boolean(checkUsage),
        );
    }
}
