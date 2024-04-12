import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AdditionalPageModule } from './pages/additional-page/additional-page.module';
import { AreaModule } from './pages/address/area/area.module';
import { DivisionModule } from './pages/address/division/division.module';
import { ZoneModule } from './pages/address/zone/zone.module';
import { AdminModule } from './pages/admin/admin.module';
import { BlogModule } from './pages/blog/blog/blog.module';
import { CartModule } from './pages/cart/cart.module';
import { AuthorModule } from './pages/catalog/author/author.module';
import { BodyTypeModule } from './pages/catalog/bodyType/bodyType.module';
import { BrandModule } from './pages/catalog/brand/brand.module';
import { CategoryModule } from './pages/catalog/category/category.module';
import { HairColorModule } from './pages/catalog/hairColor/hairColor.module';
import { IntimateHairModule } from './pages/catalog/intimateHair/intimateHair.module';
import { OrientationModule } from './pages/catalog/orientation/orientation.module';
import { PublisherModule } from './pages/catalog/publisher/publisher.module';
import { RegionModule } from './pages/catalog/region/region.module';
import { SubCategoryModule } from './pages/catalog/sub-category/sub-category.module';
import { TagModule } from './pages/catalog/tag/tag.module';
import { TypeModule } from './pages/catalog/type/type.module';
import { ContactModule } from './pages/contact/contact/contact.module';
import { NewsletterModule } from './pages/contact/newsletter/newsletter.module';
import { BannerCaroselModule } from './pages/customization/banner/banner-carosel.module';
import { CarouselModule } from './pages/customization/carousel/carousel.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { DiscountPercentModule } from './pages/discount-percent/discount-percent.module';
import { FileFolderModule } from './pages/file-folder/file-folder.module';
import { GalleryModule } from './pages/gallery/gallery.module';
import { CouponModule } from './pages/offers/coupon/coupon.module';
import { MultiPromoOfferModule } from './pages/offers/multi-promo-offer/multi-Promo-offer.module';
import { PromoOfferModule } from './pages/offers/promo-offer/promo-offer.module';
import { OtpModule } from './pages/otp/otp.module';
import { ProductModule } from './pages/product/product.module';
import { ProfileModule } from './pages/profile/profile/profile.module';
import { ReportModule } from './pages/report/report.module';
import { ReviewModule } from './pages/review/review.module';
import { OrderModule } from './pages/sales/order/order.module';
import { ShippingChargeModule } from './pages/sales/shipping-charge/shipping-charge.module';
import { UploadModule } from './pages/upload/upload.module';
import { UserModule } from './pages/user/user.module';
import { VerifiedModule } from './pages/verified/verified.module';
import { WishListModule } from './pages/wish-list/wish-list.module';
import { DbToolsModule } from './shared/db-tools/db-tools.module';
import { EmailModule } from './shared/email/email.module';
import { JobSchedulerModule } from './shared/job-scheduler/job-scheduler.module';
import { UtilsModule } from './shared/utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(configuration().mongoCluster),
    CacheModule.register({ ttl: 200, max: 10, isGlobal: true }),
    AdminModule,
    UserModule,
    UtilsModule,
    DbToolsModule,
    UploadModule,
    PromoOfferModule,
    JobSchedulerModule,
    DashboardModule,
    ProductModule,
    CarouselModule,
    BannerCaroselModule,
    CategoryModule,
    SubCategoryModule,
    PublisherModule,
    AuthorModule,
    BlogModule,
    ContactModule,
    NewsletterModule,
    TagModule,
    ReviewModule,
    ProfileModule,
    OrderModule,
    ShippingChargeModule,
    CouponModule,
    AdditionalPageModule,
    BrandModule,
    CartModule,
    WishListModule,
    MultiPromoOfferModule,
    DiscountPercentModule,
    FileFolderModule,
    TypeModule,
    GalleryModule,
    BodyTypeModule,
    IntimateHairModule,
    HairColorModule,
    RegionModule,
    OrientationModule,
    AreaModule,
    DivisionModule,
    ZoneModule,
    VerifiedModule,
    EmailModule,
    OtpModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
