import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { S3Controller } from './s3.controller.js';
import { S3Service } from './s3.service.js';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [S3Controller],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
