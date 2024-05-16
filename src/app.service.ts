import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ResponsePayload } from './interfaces/core/response-payload.interface';
import { DbToolsService } from './shared/db-tools/db-tools.service';
import { JobSchedulerService } from './shared/job-scheduler/job-scheduler.service';

@Injectable()
export class AppService {
  constructor(private jobSchedulerService: JobSchedulerService, private dbToolsService: DbToolsService) {
    this.jobSchedulerService.reAddScheduler();
    this.jobSchedulerService.autoBackupDatabaseToDrive();
    this.jobSchedulerService.productListingExpirationNotificationTrigger();
  }

  /**
   * DATABASE BACKUP & RESTORE
   * backupMongoDb()
   *
   * @param password
   */
  async backupDatabase(password: string): Promise<ResponsePayload> {
    try {
      if (password === 'ikbalsazib11') {
        await this.dbToolsService.backupMongoDb();
        return {
          success: true,
          message: 'Data Backup Success',
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'Sorry! Not allowed',
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async restoreDatabase(password: string): Promise<ResponsePayload> {
    try {
      if (password === 'ikbalsazib11') {
        await this.dbToolsService.restoreMongoDb();
        return {
          success: true,
          message: 'Data Restore Success',
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'Sorry! Not allowed',
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
