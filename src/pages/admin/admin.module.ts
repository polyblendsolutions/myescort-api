import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAdminStrategy } from './jwt-admin.strategy';
import { PASSPORT_ADMIN_TOKEN_TYPE } from '../../core/global-variables';
import { AdminSchema } from '../../schema/admin.schema';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: PASSPORT_ADMIN_TOKEN_TYPE,
      property: 'admin',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('adminJwtSecret'),
        signOptions: {
          expiresIn: configService.get<number>('adminTokenExpiredTime'),
        },
      }),
    }),
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtAdminStrategy],
  exports: [PassportModule],
})
export class AdminModule {}
