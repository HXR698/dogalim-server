import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @Post('send')
  async sendOtp(
    @Body('target') target: string,
    @Body('type') type: 'email' | 'sms',
  ) {
    await this.otpService.sendOtp(target, type);
    return {
      success: true,
      message: 'OTP kodu başarıyla gönderildi.',
    };
  }

  @Post('verify')
  async verifyOtp(
    @Body('target') target: string,
    @Body('code') code: string,
    @Body('type') type: 'email' | 'sms',
  ) {
    const isValid = await this.otpService.verifyOtp(target, code, type);

    return {
      success: true,
      message: 'OTP kodu başarıyla doğrulandı.',
      data: {
        isValid,
      },
    };
  }
}
