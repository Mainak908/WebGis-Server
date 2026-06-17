import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { S3Service } from './s3.service.js';

@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @UseGuards(JwtAuthGuard)
  @Get('presigned-url')
  async getUploadPresignedUrl(
    @Request() req: any,
    @Query('filename') filename: string,
    @Query('filetype') filetype: string,
    @Query('folder') folder?: string,
  ) {
    if (!filename || !filetype) {
      throw new BadRequestException(
        'filename and filetype query parameters are required',
      );
    }
    const userId = req.user.sub;
    return this.s3Service.getUploadPresignedUrl(
      userId,
      filename,
      filetype,
      folder,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('images')
  async fetchAllImagesFromS3() {
    return this.s3Service.fetchAllImagesFromS3();
  }

  @UseGuards(JwtAuthGuard)
  @Get('db-images')
  async getImagesFromDatabase() {
    return this.s3Service.getImagesFromDatabase();
  }
}
