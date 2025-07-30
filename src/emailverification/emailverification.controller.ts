//#region Imports
import { Controller, Post, Body } from '@nestjs/common';
import { EmailVerificationService } from './emailverification.service';
//#endregion

//#region Controller way = /verify
@Controller('verify')
export class EmailVerificationController {
  //#region Constructor
  constructor(private readonly emailVerification: EmailVerificationService) {}
  //#endregion

  //#region way = /verify/send (Send Code)
  @Post('send')
  async send(@Body() body: { email: string }) {
    await this.emailVerification.sendVerificationCode(body.email);
    return { success: true, message: 'Kod gönderildi' };
  }
  //#endregion

  //#region way = /verify/check (Check Code)
  @Post('check')
  check(@Body() body: { email: string; code: string }) {
    const valid = this.emailVerification.verifyCode(body.email, body.code);
    return valid
      ? { success: true, message: 'Doğrulama başarili' }
      : { success: false, message: 'Kod geçersiz veya süresi dolmuş' };
  }
  //#endregion
}
//#endregion