import {Module} from '@nestjs/common';
import {OrientationService} from './orientation.service';
import {OrientationController} from './orientation.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {OrientationSchema} from '../../../schema/orientation.schema';
import {ProductSchema} from '../../../schema/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'Orientation', schema: OrientationSchema},
            {name: 'Product', schema: ProductSchema},
        ]),
    ],
    providers: [OrientationService],
    controllers: [OrientationController],
})
export class OrientationModule {
}
