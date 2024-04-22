import * as fs from 'fs';

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import * as sharp from 'sharp';

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
      const imageMetadata = await image.metadata();
      const watermark = await sharp(watermarkPath)
        .resize(200) // Resize watermark to desired size
        .toBuffer();
      // Calculate the center coordinates
      const centerX = Math.floor((imageMetadata.width - 26) / 2);
      const centerY = Math.floor((imageMetadata.height - 150) / 2);
      await image
        .composite([{ input: watermark, blend: 'over', top: centerX, left: centerY }]) // Position the watermark
        .toFile(outputPath); // Save the output file
      return true;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
}
