import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hxrx82403@gmail.com',
        pass: 'hbiw easv huyz xjca', // Gmail uygulama şifresi
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: 'hxrx82403@gmail.com',
      to,
      subject,
      text,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
