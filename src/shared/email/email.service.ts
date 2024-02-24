import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor() {
    // TODO IF NEED
  }

  /**
   * EMAIL METHODS
   * getDateString
   */
  async sendEmail(email, body: string): Promise<ResponsePayload> {
    try {
      const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
      const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
      const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

      const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI,
      );
      oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

      const accessToken = await oAuth2Client.getAccessToken();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'kontakt@ogmedia.dk',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      const emailFrom = 'kontakt@ogmedia.dk';
      const toReceiver = email;

      const info = await transporter.sendMail({
        from: `" OG Media" <${emailFrom}>`,
        replyTo: emailFrom,
        to: toReceiver, //receiver
        subject: 'Thanks for your Joining', // Subject line
        // text: "Hello this is text body", // plain text body
        html: `${body}`, // html body
      });

      return {
        success: true,
        message: 'Data Added Success',
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
