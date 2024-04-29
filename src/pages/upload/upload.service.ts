import * as fs from 'fs';

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
const quality = 20;

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);

  constructor() {}

  async deleteSingleFile(path: string): Promise<ResponsePayload> {
    try {
      if (path) {
        fs.unlinkSync(path);
        return {
          success: true,
          message: 'Success! Image Successfully Removed.',
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'Error! No Path found',
        } as ResponsePayload;
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleFile(baseurl: string, url: string[]): Promise<ResponsePayload> {
    try {
      if (url && url.length) {
        url.forEach((u) => {
          const path = `.${u.replace(baseurl, '')}`;
          fs.unlinkSync(path);
        });

        return {
          success: true,
          message: 'Success! Image Successfully Removed.',
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'Error! No Path found',
        } as ResponsePayload;
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  bytesToKb(bytes: number): number {
    const res = bytes * 0.001;
    return Number(res.toFixed(2));
  }

  async addWatermark(imagePath: string, watermarkPath: string, outputPath: string) {
    try {
      const image = sharp(imagePath);
      const originalCopy = await sharp(imagePath);
      const imageMetadata = await image.metadata();
      // scale/reduce the width of the watermark to 80 % so that it has margin from left and right
      const width = Math.round(((imageMetadata.width * 80) / 100))
      const watermark = await sharp(watermarkPath)
      .resize(width, null, { fit: 'contain' })
        .toBuffer();
      // Calculate the center coordinates for the watermark
      const watermarkMetadata = await sharp(watermark).metadata();
      const top = Math.round((imageMetadata.height - watermarkMetadata.height) / 2);
      const left = Math.round((imageMetadata.width - watermarkMetadata.width) / 2);
      await image
        .composite([{ input: watermark, blend: 'over', top: top, left: left }])
        .toFormat('jpeg')
        .toFile(outputPath);
      await originalCopy.resize({ fit: 'inside', withoutEnlargement: true }).toFormat('jpeg').jpeg({ quality: quality }).toFile(outputPath.replace('images', 'preview'));
      // Delete the original image
      fs.unlinkSync(imagePath);
      return true;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
}
