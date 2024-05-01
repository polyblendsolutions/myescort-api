import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AddOtpDto, ValidateOtpDto } from '../../dto/otp.dto';
import { Otp } from '../../interfaces/common/otp.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { EmailService } from '../../shared/email/email.service';
import { UtilsService } from '../../shared/utils/utils.service';

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
   *
   * @param addOtpDto
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
                        Please enter this OTP code for complete registration.</h3>
                        </td>
                    </tr>
                
                <tr style="height: 20px;">
                    <td></td>
                </tr>
                <tr>
                    <td>
                        <p
                            style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                            Your website otp code is ${code}
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
          'Registration',
        );
        console.log(code);

        return {
          success: true,
          message: 'Success! OTP code has been sent to your email.',
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
                                  Please enter this OTP code for complete registration.</h3>
                                  </td>
                              </tr>
                          
                          <tr style="height: 20px;">
                              <td></td>
                          </tr>
                          <tr>
                              <td>
                                  <p
                                      style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                                      Your website otp code is ${code}
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
          'Registration',
        );

        console.log(code);

        return {
          success: true,
          message: 'Success! OTP code has been sent to your email.',
          data,
        } as ResponsePayload;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async validateOtpWithEmail(ValidateOtpDto: ValidateOtpDto): Promise<ResponsePayload> {
    try {
      const { email } = ValidateOtpDto;
      const { code } = ValidateOtpDto;

      const otpData = await this.otpModel.findOne({ email });

      if (otpData) {
        const isExpired = this.utilsService.getDateDifference(new Date(), new Date(otpData.expireTime), 'seconds');

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
