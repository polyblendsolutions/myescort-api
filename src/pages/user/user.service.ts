import {
  BadRequestException,
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { VerifiedStatus } from 'src/enum/verified-status.enum';
import { Product } from 'src/interfaces/common/product.interface';
import { Subscription } from 'src/interfaces/common/subscription.interface';

import { ChangePasswordDto } from '../../dto/change-password.dto';
import {
  AuthSocialUserDto,
  AuthUserDto,
  CheckUserDto,
  CheckNewEmailDto,
  CheckUserRegistrationDto,
  CreateSocialUserDto,
  CreateUserDto,
  FilterAndPaginationUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserSelectFieldDto,
  UpdateUserSubscriptionPlanDto,
} from '../../dto/user.dto';
import { ErrorCodes } from '../../enum/error-code.enum';
import { AdminAuthResponse } from '../../interfaces/admin/admin.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { User, UserAuthResponse, UserJwtPayload } from '../../interfaces/user/user.interface';
import { EmailService } from '../../shared/email/email.service';
import { UtilsService } from '../../shared/utils/utils.service';
import { OtpService } from '../otp/otp.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  // Cache
  private readonly cacheAllData = 'getAllUser';
  private readonly cacheDataCount = 'getCountUser';

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Subscriptions') private readonly subscriptionModel: Model<Subscription>,
    @InjectModel('Products') private readonly productModel: Model<Product>,
    @InjectModel('UserSubscriptions') private readonly userSubscriptionsModel: Model<User>,
    protected jwtService: JwtService,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private emailService: EmailService,
    private otpService: OtpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * User Signup
   * User Login
   * User Signup & Login
   * checkUserForRegistration()
   *
   * @param createUserDto
   */
  async userSignup(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);

    const mData = { ...createUserDto, ...{ password: hashedPass } };
    const newUser = new this.userModel(mData);
    try {
      const saveData = await newUser.save();
      // Cache Removed
      await this.cacheManager.del(this.cacheAllData);
      await this.cacheManager.del(this.cacheDataCount);

      await this.emailService.sendEmail(
        createUserDto['email'],
        `
        <h1>we are checking...</h1>
        `,
        'Thank you for joining',
      );

      return {
        success: true,
        message: 'Success',
        username: saveData.username,
        name: saveData.name,
        _id: saveData._id,
      } as User;
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async userLogin(authUserDto: AuthUserDto): Promise<UserAuthResponse> {
    try {
      console.log('authUserDto', authUserDto);
      const user = (await this.userModel
        .findOne({ username: authUserDto.username })
        .select('password username hasAccess')) as User;

      if (!user) {
        return {
          success: false,
          message: 'This username no is not registered!',
        } as UserAuthResponse;
      }

      if (!user.hasAccess) {
        return {
          success: false,
          message: 'No Access for Login',
        } as AdminAuthResponse;
      }

      const isMatch = await bcrypt.compare(authUserDto.password, user.password);

      if (isMatch) {
        const payload: UserJwtPayload = {
          _id: user._id,
          username: user.username,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
          success: true,
          message: 'Login successfull',
          data: {
            _id: user._id,
          },
          token: accessToken,
          tokenExpiredIn: this.configService.get<number>('userTokenExpiredTime'),
        } as UserAuthResponse;
      } else {
        return {
          success: false,
          message: 'Password not matched!',
          data: null,
          token: null,
          tokenExpiredIn: null,
        } as UserAuthResponse;
      }
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async userLoginSocial(authUserDto: AuthSocialUserDto): Promise<UserAuthResponse> {
    try {
      const user = (await this.userModel
        .findOne({ username: authUserDto.username })
        .select('username hasAccess')) as User;

      if (!user) {
        return {
          success: false,
          message: 'No user data found!',
        } as UserAuthResponse;
      }

      if (!user.hasAccess) {
        return {
          success: false,
          message: 'No Access for Login',
        } as AdminAuthResponse;
      }

      const payload: UserJwtPayload = {
        _id: user._id,
        username: user.username,
      };
      const accessToken = this.jwtService.sign(payload);
      return {
        success: true,
        message: 'Login success!',
        data: {
          _id: user._id,
        },
        token: accessToken,
        tokenExpiredIn: this.configService.get<number>('userTokenExpiredTime'),
      } as UserAuthResponse;
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async userSignupAndLogin(createUserDto: CreateUserDto): Promise<UserAuthResponse> {
    try {
      const userData = await this.userModel.findOne({
        username: createUserDto.username,
      });
      if (userData) {
        return {
          success: false,
          message: 'Sorry! Phone No Or User Name already registered.',
          data: null,
          token: null,
          tokenExpiredIn: null,
        } as UserAuthResponse;
      } else {
        const { password } = createUserDto;
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(password, salt);

        const mData = {
          ...createUserDto,
          ...{ password: hashedPass },
        };
        const newUser = new this.userModel(mData);

        const saveData = await newUser.save();
        const authUserDto: AuthUserDto = {
          username: saveData.username,
          password: password,
        };
        // Cache Removed
        await this.cacheManager.del(this.cacheAllData);
        await this.cacheManager.del(this.cacheDataCount);
        // email send
        this.emailService.sendEmail(
          createUserDto['email'],
          `<body style="margin: 0px;background-color: #f658a8;">
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
                                  We are checking your information.</h3>
                                  </td>
                              </tr>
                          
                          <tr style="height: 20px;">
                              <td></td>
                          </tr>
                          <tr>
                              <td>
                                  <p
                                      style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                                      Thank You
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

        return this.userLogin(authUserDto);
      }
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async userSignupAndLoginSocial(createUserDto: CreateSocialUserDto): Promise<UserAuthResponse> {
    try {
      const userData = await this.userModel.findOne({
        username: createUserDto.username,
      });

      if (userData) {
        const authUserDto: AuthSocialUserDto = {
          username: userData.username,
        };
        return this.userLoginSocial(authUserDto);
      } else {
        const newUser = new this.userModel(createUserDto);

        const saveData = await newUser.save();
        const authUserDto: AuthSocialUserDto = {
          username: saveData.username,
        };

        // Cache Removed
        await this.cacheManager.del(this.cacheAllData);
        await this.cacheManager.del(this.cacheDataCount);

        return this.userLoginSocial(authUserDto);
      }
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async checkUserForRegistration(checkUserRegistrationDto: CheckUserRegistrationDto): Promise<ResponsePayload> {
    try {
      const userData = await this.userModel.findOne({
        username: checkUserRegistrationDto.email,
      });
      if (userData) {
        // await this.otpService.generateOtpWithPhoneNo({
        //   phone: checkUserRegistrationDto.phone,
        // });
        return {
          success: true,
          message: 'Success! Otp has been sent to your email.',
          data: { username: userData.username, otp: true },
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'User not exists. Please check your email',
          data: { otp: false },
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Email is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Logged-in User Info
   * Get All Users (Not Recommended)
   * Get All Users V3 (Filter, Pagination, Select, Sort, Search Query with Aggregation) ** Recommended
   * Get All Users by Search
   *
   * @param user
   * @param selectQuery
   */
  async getLoggedInUserData(user: User, selectQuery: UserSelectFieldDto): Promise<ResponsePayload> {
    try {
      let { select } = selectQuery;
      if (!select) {
        select = '-password';
      }
      const data = await this.userModel.findById(user._id).select(select);
      return {
        data,
        success: true,
      } as ResponsePayload;
    } catch (err) {
      this.logger.error(`${user.username} is failed to retrieve data`);
      throw new InternalServerErrorException();
    }
  }

  /**
   * User Subscription Info
   *
   * @param user
   */
  async getUserSubscription(user: User): Promise<ResponsePayload> {
    try {
      const data = await this.userSubscriptionsModel.find({ userId: user._id }).populate('subscriptionId');
      return {
        data,
        success: true,
      } as ResponsePayload;
    } catch (err) {
      this.logger.error(`${user.username} is failed to retrieve data`);
      // console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async getAllUsers(filterUserDto: FilterAndPaginationUserDto, searchQuery?: string): Promise<ResponsePayload> {
    const { filter } = filterUserDto;
    const { pagination } = filterUserDto;
    const { sort } = filterUserDto;
    const { select } = filterUserDto;

    /*** GET FROM CACHE ***/
    if (!pagination && !filter) {
      const cacheData: any[] = await this.cacheManager.get(this.cacheAllData);
      const count: number = await this.cacheManager.get(this.cacheDataCount);
      if (cacheData) {
        this.logger.log('Cached page');
        return {
          data: cacheData,
          success: true,
          message: 'Success',
          count: count,
        } as ResponsePayload;
      }
    }
    this.logger.log('Not a Cached page');

    // Modify Id as Object ID
    if (filter && filter['designation._id']) {
      filter['designation._id'] = new ObjectId(filter['designation._id']);
    }

    if (filter && filter['userType._id']) {
      filter['userType._id'] = new ObjectId(filter['userType._id']);
    }

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };
    }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { username: { $regex: searchQuery, $options: 'i' } },
              { phone: { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
      };
    }
    // Sort
    if (sort) {
      mSort = sort;
    } else {
      mSort = { createdAt: -1 };
    }

    // Select
    if (select) {
      // Remove Sensitive Select
      delete select.password;
      mSelect = { ...mSelect, ...select };
    } else {
      mSelect = { password: 0 };
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      aggregateStages.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateStages.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateStages.push({ $project: mSelect });
    }

    // Pagination
    if (pagination) {
      // Remove Sensitive Select
      delete mSelect['password'];
      if (Object.keys(mSelect).length) {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
              { $project: mSelect },
            ],
          },
        };
      } else {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
              { $project: { password: 0 } },
            ],
          },
        };
      }

      aggregateStages.push(mPagination);

      aggregateStages.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.userModel.aggregate(aggregateStages);
      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{ success: true, message: 'Success' },
        } as ResponsePayload;
      } else {
        /*** SET CACHE DATA**/
        if (!filter) {
          await this.cacheManager.set(this.cacheAllData, dataAggregates);
          await this.cacheManager.set(this.cacheDataCount, dataAggregates.length);
          this.logger.log('Cache Added');
        }

        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
        } as ResponsePayload;
      }
    } catch (err) {
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get User by ID
   * Update User by Id
   * Delete User by Id
   */

  async getUserById(id: string, userSelectFieldDto: UserSelectFieldDto): Promise<ResponsePayload> {
    try {
      let { select } = userSelectFieldDto;
      if (!select) {
        select = '-password';
      }
      const data = await this.userModel.findById(id).lean(true).select(select);
      //TODO: refactor in near future by using .populate and adding ref of product in user.
      const product = await this.productModel.findOne({ 'user._id': id }).lean(true).select('_id shortId');
      data.shortId = product ? (product.shortId ? product.shortId : '') : '';

      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateLoggedInUserInfo(users: User, updateUserDto: UpdateUserDto): Promise<ResponsePayload> {
    const { password, username } = updateUserDto;
    let user;
    try {
      user = await this.userModel.findById(users._id);
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('No User found!');
    }
    try {
      // Check Username
      if (username) {
        const isExists = await this.userModel.findOne({ username });
        if (isExists) {
          return {
            success: false,
            message: 'Username already exists',
          } as ResponsePayload;
        }
      }

      // Cache Removed
      await this.cacheManager.del(this.cacheAllData);
      await this.cacheManager.del(this.cacheDataCount);

      // Check Password
      if (password) {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(password, salt);
        await this.userModel.findByIdAndUpdate(users._id, {
          $set: { ...updateUserDto, ...{ password: hashedPass } },
        });
        return {
          success: true,
          message: 'Data & Password changed success',
        } as ResponsePayload;
      }
      await this.userModel.findByIdAndUpdate(users._id, {
        $set: updateUserDto,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async changeLoggedInUserPassword(users: User, changePasswordDto: ChangePasswordDto): Promise<ResponsePayload> {
    const { password, oldPassword } = changePasswordDto;
    let user;
    try {
      user = await this.userModel.findById(users._id).select('password email username');
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('No User found!');
    }
    try {
      // Check Old Password
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      // Change Password
      if (isMatch) {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(password, salt);
        await this.userModel.findByIdAndUpdate(users._id, {
          $set: { password: hashedPass },
        });

        await this.emailService.sendEmail(
          user.email,
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
                                  Password Change</h3>
                                  </td>
                              </tr>
                          
                          <tr style="height: 20px;">
                              <td></td>
                          </tr>
                          <tr>
                              <td>
                                  <p
                                      style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                                      Hi ${user.username ?? ''}! Your Password is changed successfully.
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
          'Your password has been changed',
        );

        return {
          success: true,
          message: 'Password changed success',
        } as ResponsePayload;
      } else {
        return {
          success: false,
          message: 'Old password is incorrect!',
        } as ResponsePayload;
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async checkUserAndSentOtp(checkUserDto: CheckUserDto): Promise<ResponsePayload> {
    try {
      const { email, username } = checkUserDto;
      const user = await this.userModel.findOne({ username: username });

      if (!user) {
        return this.otpService.generateOtpWithEmail({ email });
      } else {
        return {
          success: false,
          message: 'Sorry! This username is already registered.',
        } as ResponsePayload;
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async checkNewEmailAndSentOtp(checkUserDto: CheckNewEmailDto): Promise<ResponsePayload> {
    try {
      const { email, newEmail } = checkUserDto;
      const user = await this.userModel.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: 'Sorry! This email is not registered.',
        } as ResponsePayload;
      }
      const newEmailExist = await this.userModel.findOne({ email: newEmail });
      if (newEmailExist) {
        return {
          success: false,
          message: 'Sorry! This email is already registered.',
        } as ResponsePayload;
      }
      return this.otpService.generateOtpWithEmail({ email: newEmail });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async resetUserPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponsePayload> {
    const { password, phone } = resetPasswordDto;
    let user;
    try {
      user = await this.userModel.findOne({ username: phone }).select('password');
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('No User found!');
    }
    try {
      const salt = await bcrypt.genSalt();
      const hashedPass = await bcrypt.hash(password, salt);
      await this.userModel.findByIdAndUpdate(user._id, {
        $set: { password: hashedPass },
      });
      return {
        success: true,
        message: 'Password reset success',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<ResponsePayload> {
    const { newPassword, username, isVerfied, comment } = updateUserDto;
    let user;
    try {
      user = await this.userModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('No user found!');
    }
    try {
      // Check Username
      if (username) {
        if (user.username !== username) {
          const isExists = await this.userModel.findOne({ username });
          if (isExists) {
            return {
              success: false,
              message: 'Username already exists',
            } as ResponsePayload;
          }
        }
      }
      // Cache Removed
      await this.cacheManager.del(this.cacheAllData);
      await this.cacheManager.del(this.cacheDataCount);

      // Check Password
      if (newPassword) {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(newPassword, salt);
        await this.userModel.findByIdAndUpdate(id, {
          $set: { ...updateUserDto, ...{ password: hashedPass } },
        });
        return {
          success: true,
          message: 'Data & Password changed success',
        } as ResponsePayload;
      }

      //check isVerified
      if (isVerfied || comment) {
        await this.emailService.sendEmail(
          user.email,
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
                                  Profile Verification</h3>
                                  </td>
                              </tr>
                          
                          <tr style="height: 20px;">
                              <td></td>
                          </tr>
                          <tr>
                              <td>
                                  <p
                                      style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                                      Hi! Your profile is ${isVerfied ? 'verified' : `not verified as ${comment}`}.
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
          'Your verification status has been changed',
        );
      }
      // Delete No Action Data
      delete updateUserDto.password;
      if (updateUserDto['isVerfied'] && updateUserDto['verifiedStatus'] === VerifiedStatus.Verified) {
        const product = await this.productModel.updateMany(
          { ['user._id']: id },
          {
            $set: { 'user.isVerfied': true },
          },
        );
      }
      await this.userModel.findByIdAndUpdate(id, {
        $set: updateUserDto,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async deleteUserById(id: string): Promise<ResponsePayload> {
    let user;
    try {
      user = await this.userModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('No User found!');
    }
    try {
      await this.userModel.findByIdAndDelete(id);
      // Cache Removed
      await this.cacheManager.del(this.cacheAllData);
      await this.cacheManager.del(this.cacheDataCount);

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async deleteMultipleUserById(ids: string[], checkUsage: boolean): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.userModel.deleteMany({ _id: mIds });
      // Cache Removed
      await this.cacheManager.del(this.cacheAllData);
      await this.cacheManager.del(this.cacheDataCount);

      // Reset Product Category Reference
      // if (checkUsage) {
      //   const defaultData = await this.taskModel.findOne({
      //     readOnly: true,
      //   });
      //   const resetData = {
      //     task: {
      //       _id: defaultData._id,
      //       name: defaultData.name,
      //     },
      //   };
      //
      //   // Update Product
      //   await this.userModel.updateMany(
      //     { 'task._id': { $in: mIds } },
      //     { $set: resetData },
      //   );
      // }
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async activateVipAndCreatePayment(id: string, data: UpdateUserSubscriptionPlanDto): Promise<ResponsePayload> {
    const { subscriptionId } = data;
    let user, subscription;

    //check if user exists
    try {
      user = await this.userModel.findById(id).select('_id email username');
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('No User found!');
    }

    //check if subscription exists
    try {
      subscription = await this.subscriptionModel.findOne({ _id: subscriptionId }).lean(true);
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!subscription) {
      throw new NotFoundException('No subscription found!');
    }
    try {
      const newSubscription = new this.userSubscriptionsModel({ userId: user._id, subscriptionId: subscriptionId });
      const saveData = await newSubscription.save();
      const latestPublishedProduct = await this.productModel
        .findOne({ 'user._id': id }, { status: 'publish' })
        .lean(true)
        .sort({ createdAt: -1 }).select('status vipStatusExpiredOn');;
      if (latestPublishedProduct) {
        const vipStatusActivatedOn = new Date();
        const vipExpiredOn = latestPublishedProduct['vipStatusExpiredOn']
        const vipStatusExpiredOn = vipExpiredOn ? (new Date(vipExpiredOn) >= new Date()) ? vipExpiredOn : new Date() : new Date();
        vipStatusExpiredOn.setDate(vipStatusExpiredOn.getDate() + subscription.days);
        await this.productModel.findOneAndUpdate(
          { _id: latestPublishedProduct._id },
          {
            $set: { isVipStatusActive: true, vipStatusActivatedOn: vipStatusActivatedOn, vipStatusExpiredOn: vipStatusExpiredOn },
          },
          { new: true },
        );
      }

      await this.emailService.sendEmail(
        user.email,
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
                        Subscription Purchased</h3>
                        </td>
                    </tr>
                
                <tr style="height: 20px;">
                    <td></td>
                </tr>
                <tr>
                    <td>
                        <p
                            style="margin: 0px;font-family:Arial, Helvetica, sans-serif;line-height: 28px;color: #646464;text-align: center;">
                            Hi ${user.username ?? ''}!, Your Subscription is active now.
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
        'Thank you for purchasing a new subscription',
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
