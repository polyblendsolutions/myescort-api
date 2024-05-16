import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as schedule from 'node-schedule';
import { PromoOffer } from '../../interfaces/common/promo-offer.interface';
import { JobScheduler } from '../../interfaces/core/job-scheduler.interface';
import { DbToolsService } from '../db-tools/db-tools.service';
import { UtilsService } from '../utils/utils.service';
import { ProductSchema } from 'src/schema/product.schema';
import { Product } from 'src/interfaces/common/product.interface';
// import * as moment from "moment-timezone";
import { User } from 'src/interfaces/user/user.interface';
import { EmailService } from '../email/email.service';

@Injectable()
export class JobSchedulerService {
  private logger = new Logger(JobSchedulerService.name);

  constructor(
    @InjectModel('JobScheduler')
    private readonly jobSchedulerModel: Model<JobScheduler>,
    @InjectModel('PromoOffer')
    private readonly promoOfferModel: Model<PromoOffer>,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private dbToolsService: DbToolsService,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  /**
   * CORN JOB
   * autoBackupDatabaseToDrive()
   * addOfferScheduleOnStart()
   * addOfferScheduleOnEnd()
   * cancelOfferJobScheduler()
   * reAddScheduler()
   */

  async autoBackupDatabaseToDrive() {
    schedule.scheduleJob('00 00 12 * * 0-6', async () => {
      console.log('Database Backing up...');
      await this.dbToolsService.backupMongoDb();
    });
  }

  // async subscriptionExpireNotification() {
  //   schedule.scheduleJob('0 12 * * *', async () => {
  //     this.expireSubscription()
  //   });
  // }

  // async expireSubscription() {
  //   const users = await this.userModel.find().lean(true);
  //   if(users.length && users.length > 0) {
  //     for(let value of users) {

  //     }
  //   }
  // }

  async addOfferScheduleOnStart(isNew: boolean, id: string, expTime: Date, products: any[], jobId?: string) {
    const jobName = this.configService.get<string>('promoOfferScheduleOnStart');
    let saveJob;
    if (isNew) {
      const data: JobScheduler = {
        name: jobName,
        collectionName: 'PromoOffer',
        id: id,
      };

      // Save on DB
      const jobScheduler = new this.jobSchedulerModel(data);
      saveJob = await jobScheduler.save();
    }

    schedule.scheduleJob(jobName, expTime, async () => {
      this.logger.log('DOING at -> ' + jobName + '---' + expTime.toString());
      await this.utilsService.updateProductsOnOfferStart(products);
      await this.jobSchedulerModel.deleteOne({
        _id: isNew ? saveJob._id : jobId,
      });
    });
  }

  async addOfferScheduleOnEnd(isNew: boolean, id: string, expTime: Date, products: any[], jobId?: string) {
    const jobName = this.configService.get<string>('promoOfferScheduleOnEnd');
    let saveJob;
    if (isNew) {
      const data: JobScheduler = {
        name: jobName,
        collectionName: 'PromoOffer',
        id: id,
      };

      // Save on DB
      const jobScheduler = new this.jobSchedulerModel(data);
      saveJob = await jobScheduler.save();
    }

    schedule.scheduleJob(jobName, expTime, async () => {
      this.logger.log('DOING at -> ' + jobName + '---' + expTime.toString());
      await this.utilsService.updateProductsOnOfferEnd(products);
      await this.jobSchedulerModel.deleteOne({
        _id: isNew ? saveJob._id : jobId,
      });
      await this.promoOfferModel.findByIdAndDelete(id);
    });
  }

  async cancelOfferJobScheduler(name: string) {
    schedule.cancelJob(name);
    await this.jobSchedulerModel.deleteOne({
      collectionName: 'PromoOffer',
      name: name,
    });
  }

  async reAddScheduler() {
    const jobScheduler = await this.jobSchedulerModel.find();
    const mJobScheduler = JSON.parse(JSON.stringify(jobScheduler));

    console.log('mJobScheduler', mJobScheduler);

    if (mJobScheduler && mJobScheduler.length) {
      for (const f of mJobScheduler) {
        const offer = await this.promoOfferModel.findById(f.id);

        if (offer) {
          const isStartDate = this.utilsService.getDateDifference(new Date(), new Date(offer.startDateTime), 'seconds');
          const isEndDate = this.utilsService.getDateDifference(new Date(), new Date(offer.endDateTime), 'seconds');
          const jobNameStart = this.configService.get<string>('promoOfferScheduleOnStart');
          const jobNameEnd = this.configService.get<string>('promoOfferScheduleOnEnd');
          if (f.name === jobNameStart) {
            if (isStartDate <= 0) {
              await this.utilsService.updateProductsOnOfferStart(offer.products);
              await this.jobSchedulerModel.findByIdAndDelete(f._id);
            } else {
              await this.addOfferScheduleOnStart(false, f.id, offer.startDateTime, offer.products, f._id);
            }
          }
          if (f.name === jobNameEnd) {
            if (isEndDate <= 0) {
              await this.utilsService.updateProductsOnOfferEnd(offer.products);
              await this.promoOfferModel.findByIdAndDelete(f.id);
              await this.jobSchedulerModel.findByIdAndDelete(f._id);
            } else {
              await this.addOfferScheduleOnEnd(false, f.id, offer.endDateTime, offer.products, f._id);
            }
          }
        }
      }
    }
  }

  async productListingExpirationNotificationTrigger() {
    console.log('### BEGIN:Product listing exipiration notification ###');

    // schedule.scheduleJob('00 00 14 * * 0-6', async (fireDate) => {
    schedule.scheduleJob('* */5 * * * *', async (fireDate) => {
      console.log('### BEGIN:Product listing exipiration notification ###');
      console.log('Scheduled at: ', fireDate);
      console.log('Scheduled at: ', new Date());

      const MILISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
      const daysGap = 7;
      const now = new Date();
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - daysGap);

      console.log(' === comparision for publish date === ', {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + MILISECONDS_IN_DAY), // Ensures the range includes only the 29th day
      });
      const products = await this.productModel
        .find({
          publishDate: {
            $gte: targetDate,
            $lt: new Date(targetDate.getTime() + MILISECONDS_IN_DAY), // Ensures the range includes only the 29th day
          },
        })
        .exec();
      console.log(' === product count === ', products.length);
      console.log(
        ' === product users === ',
        products?.map((e) => ({ [e?.id]: { ...e?.user } })),
      );
      products?.map((e) => {
        this.emailService.sendEmail(
          e?.user?.email,
          `
        
<body style="margin: 0px;background-color: #f658a8;">
<div
    style="background-color: #fff;background-repeat: no-repeat;background-size: cover;min-height:100vh">
    <table style="width:100%;margin:0 auto;max-width:660px;">
        <tr>
            <td style="height:50px" colspan="2"></td>
        </tr>
        <tr>
      
        <td colspan="2">

            <table
                style="width:100%;margin: auto;background-color: #fff;padding: 30px;border-radius: 15px; border: 2px solid #f658a8;">

                    <tr style="text-align: center; background-color: #f658a8;">
                        <td
                            style="margin: 0px;padding: 40px;font-family:Arial, Helvetica, sans-serif;color:#fff;font-size: 21px;text-align: center;border-radius: 15px;">
                            
                        <h3
                        style="margin: 0px;font-family:Arial, Helvetica, sans-serif;color:#fff;font-size: 21px;text-align: center;">
                        Product Expiring Soon</h3>
                        </td>
                    </tr>
                
                <tr style="height: 20px;">
                    <td></td>
                </tr>
                <tr>
                    <td>
                        <p
                            style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                            Your listing <a href='${process.env.CLIENT_DOMAIN}/ad-details/${e.id}}'>${e.name}</a> is expiring in a day.
                        </p>
                    </td>
                </tr>
                <tr style="height: 40px;">
                    <td></td>
                </tr>
                <tr style="  height: 20px;">
                    <td></td>
                </tr>
                <tr style="background: #f658a8;  height: 1px;">
                    <td></td>
                </tr>
                <tr style="  height: 20px;">
                    <td></td>
                </tr>
                <tr>
                    <td>
                        <p
                            style="margin: 0px;font-family:Arial, Helvetica, sans-serif;font-size: 12px;color: #888888;text-align: center;">
                            © Copyright 2022 - 2023 MyEscort. All Rights Reserved</p>
                    </td>
                </tr>
                <tr>
                    <td colspan="1"></td>
                </tr>
            </table>
        </td>
        </tr>

        <tr>
            <td style="height:50px" colspan="2"></td>
        </tr>
    </table>

</div>
</body>
        `,
          'Your listing expires soon',
        );
      });

      console.log('### END:Product listing exipiration notification ###');
    });
  }
}
