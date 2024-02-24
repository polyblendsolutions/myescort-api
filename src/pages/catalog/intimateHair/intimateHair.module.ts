import {Module} from '@nestjs/common';
import {IntimateHairService} from './intimateHair.service';
import {IntimateHairController} from './intimateHair.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {IntimateHairSchema} from '../../../schema/intimateHair.schema';
import {ProductSchema} from '../../../schema/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'IntimateHair', schema: IntimateHairSchema},
            {name: 'Product', schema: ProductSchema},
        ]),
    ],
    providers: [IntimateHairService],
    controllers: [IntimateHairController],
})
export class IntimateHairModule {
}
