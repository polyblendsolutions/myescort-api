import {Module} from '@nestjs/common';
import {BodyTypeService} from './bodyType.service';
import {BodyTypeController} from './bodyType.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {BodyTypeSchema} from '../../../schema/bodyType.schema';
import {ProductSchema} from '../../../schema/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'BodyType', schema: BodyTypeSchema},
            {name: 'Product', schema: ProductSchema},
        ]),
    ],
    providers: [BodyTypeService],
    controllers: [BodyTypeController],
})
export class BodyTypeModule {
}
