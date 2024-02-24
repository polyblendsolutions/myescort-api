import {Module} from '@nestjs/common';
import {RegionService} from './region.service';
import {RegionController} from './region.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {RegionSchema} from '../../../schema/region.schema';
import {ProductSchema} from '../../../schema/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'Region', schema: RegionSchema},
            {name: 'Product', schema: ProductSchema},
        ]),
    ],
    providers: [RegionService],
    controllers: [RegionController],
})
export class RegionModule {
}
