import {Module} from '@nestjs/common';
import {HairColorService} from './hairColor.service';
import {HairColorController} from './hairColor.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {HairColorSchema} from '../../../schema/hairColor.schema';
import {ProductSchema} from '../../../schema/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'HairColor', schema: HairColorSchema},
            {name: 'Product', schema: ProductSchema},
        ]),
    ],
    providers: [HairColorService],
    controllers: [HairColorController],
})
export class HairColorModule {
}
