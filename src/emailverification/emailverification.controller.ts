import { Controller, Post, Body } from '@nestjs/common';
import { EmailVerificationService } from './emailverification.service';

@Controller('verify')
export class EmailVerificationController {
  constructor(private readonly emailVerification: EmailVerificationService) {}

  @Post('send')
  async send(@Body() body: { mail_adr: string }) {
    await this.emailVerification.sendVerificationCode(body.mail_adr);
    console.log("verify/send");
    return { success: true, message: 'Kod gönderildi' };
  }

  @Post('check')
  check(@Body() body: { email: string; code: string; }) {
    console.log("verify/check");
    return this.emailVerification.verifyCode(body.email, body.code);
  }
}