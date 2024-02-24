import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddOtpDto, ValidateOtpDto } from '../../dto/otp.dto';
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Otp } from '../../interfaces/common/otp.interface';
import { EmailService } from "../../shared/email/email.service";

const ObjectId = Types.ObjectId;

@Injectable()
export class OtpService {
  private logger = new Logger(OtpService.name);

  constructor(
    @InjectModel('Otp')
    private readonly otpModel: Model<Otp>,
    private utilsService: UtilsService,
    private emailService: EmailService,
  ) {}

  /**
   * OTP FUNCTIONS
   * generateOtpWithEmail()
   * validateOtpWithEmail()
   */
  async generateOtpWithEmail(addOtpDto: AddOtpDto): Promise<ResponsePayload> {
    try {
      const { email } = addOtpDto;

      const otpData = await this.otpModel.findOne({ email });

      if (otpData) {
        await this.otpModel.findByIdAndDelete(otpData._id);

        const code = this.utilsService.getRandomOtpCode4();
        const expireTime = this.utilsService.addMinuteInCurrentTime(5);

        const newData = new this.otpModel({
          email,
          code,
          expireTime,
          count: 1,
        });

        const saveData = await newData.save();
        const data = {
          _id: saveData._id,
        };
        // Sent Email
        this.emailService.sendEmail(
          email,
          `
        <h5>Please enter this OTP code for complete registration.</h5>
        <p>Your website otp code is ${code}</p>
        `
        );
        console.log(code);

        return {
          success: true,
          message: 'Success! OTP code has been sent to your phone number.',
          data,
        } as ResponsePayload;
      } else {
        const code = this.utilsService.getRandomOtpCode4();
        const expireTime = this.utilsService.addMinuteInCurrentTime(5);

        const newData = new this.otpModel({
          email,
          code,
          expireTime,
          count: 1,
        });

        const saveData = await newData.save();
        const data = {
          _id: saveData._id,
        };
        // Sent Email
        this.emailService.sendEmail(
          email,
          `
        <h5>Please enter this OTP code for complete registration.</h5>
        <p>Your website otp code is ${code}</p>
        `
        );

        console.log(code);

        return {
          success: true,
          message: 'Success! OTP code has been sent to your phone number.',
          data,
        } as ResponsePayload;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async validateOtpWithEmail(
    ValidateOtpDto: ValidateOtpDto,
  ): Promise<ResponsePayload> {
    try {
      const { email } = ValidateOtpDto;
      const { code } = ValidateOtpDto;

      const otpData = await this.otpModel.findOne({ email });

      if (otpData) {
        const isExpired = this.utilsService.getDateDifference(
          new Date(),
          new Date(otpData.expireTime),
          'seconds',
        );

        if (isExpired <= 0) {
          return {
            success: false,
            message: 'Sorry! Invalid OTP',
            data: null,
          } as ResponsePayload;
        } else {
          if (code === otpData.code) {
            return {
              success: true,
              message: 'Success! OTP matched',
              data: null,
            } as ResponsePayload;
          } else {
            return {
              success: false,
              message: 'Sorry! Invalid OTP',
              data: null,
            } as ResponsePayload;
          }
        }
      } else {
        return {
          success: false,
          message: 'Sorry! Invalid OTP',
          data: null,
        } as ResponsePayload;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
