import { ProductModule } from './pages/product/product.module';
import { BannerCaroselModule } from './pages/customization/banner/banner-carosel.module';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './pages/user/user.module';
import { AdminModule } from './pages/admin/admin.module';
import { UtilsModule } from './shared/utils/utils.module';
import { UploadModule } from './pages/upload/upload.module';
import { DbToolsModule } from './shared/db-tools/db-tools.module';
import { PromoOfferModule } from './pages/offers/promo-offer/promo-offer.module';
import { JobSchedulerModule } from './shared/job-scheduler/job-scheduler.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { CarouselModule } from './pages/customization/carousel/carousel.module';
import { CategoryModule } from './pages/catalog/category/category.module';
import { SubCategoryModule } from './pages/catalog/sub-category/sub-category.module';
import { PublisherModule } from './pages/catalog/publisher/publisher.module';
import { AuthorModule } from './pages/catalog/author/author.module';
import { BlogModule } from './pages/blog/blog/blog.module';
import { ContactModule } from './pages/contact/contact/contact.module';
import { NewsletterModule } from './pages/contact/newsletter/newsletter.module';
import { TagModule } from './pages/catalog/tag/tag.module';
import { BrandModule } from './pages/catalog/brand/brand.module';
import { ReviewModule } from './pages/review/review.module';
import { ProfileModule } from './pages/profile/profile/profile.module';
import { OrderModule } from './pages/sales/order/order.module';
import { ShippingChargeModule } from './pages/sales/shipping-charge/shipping-charge.module';
import { CouponModule } from './pages/offers/coupon/coupon.module';
import { AdditionalPageModule } from './pages/additional-page/additional-page.module';
import { CartModule } from './pages/cart/cart.module';
import { WishListModule } from './pages/wish-list/wish-list.module';
import { MultiPromoOfferModule } from './pages/offers/multi-promo-offer/multi-Promo-offer.module';
import { DiscountPercentModule } from './pages/discount-percent/discount-percent.module';
import { FileFolderModule } from './pages/file-folder/file-folder.module';
import { GalleryModule } from './pages/gallery/gallery.module';
import { TypeModule } from './pages/catalog/type/type.module';
import { BodyTypeModule } from './pages/catalog/bodyType/bodyType.module';
import { IntimateHairModule } from './pages/catalog/intimateHair/intimateHair.module';
import { HairColorModule } from './pages/catalog/hairColor/hairColor.module';
import { RegionModule } from './pages/catalog/region/region.module';
import { OrientationModule } from './pages/catalog/orientation/orientation.module';
import { AreaModule } from './pages/address/area/area.module';
import { DivisionModule } from './pages/address/division/division.module';
import { ZoneModule } from './pages/address/zone/zone.module';
import { VerifiedModule } from './pages/verified/verified.module';
import { EmailModule } from "./shared/email/email.module";
import { OtpModule } from "./pages/otp/otp.module";
import { ReportModule } from './pages/report/report.module';

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
    ReportModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
