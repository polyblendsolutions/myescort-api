import { Body, Controller, Logger, Post, UsePipes, ValidationPipe } from '@nestjs/common';

import { OtpService } from './otp.service';
import { AddOtpDto, ValidateOtpDto } from '../../dto/otp.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';

@Controller('otp')
export class OtpController {
  private logger = new Logger(OtpController.name);

  constructor(private otpService: OtpService) {}

  /**
   * addOtp
   * insertManyOtp
   *
   * @param addOtpDto
   */
  @Post('/generate-otp')
  @UsePipes(ValidationPipe)
  async generateOtpWithPhoneNo(
    @Body()
    addOtpDto: AddOtpDto,
  ): Promise<ResponsePayload> {
    return await this.otpService.generateOtpWithEmail(addOtpDto);
  }

  @Post('/validate-otp')
  @UsePipes(ValidationPipe)
  async validateOtpWithPhoneNo(
    @Body()
    validateOtpDto: ValidateOtpDto,
  ): Promise<ResponsePayload> {
    return await this.otpService.validateOtpWithEmail(validateOtpDto);
  }
}
