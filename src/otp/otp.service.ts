import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class OtpService {
  constructor(private readonly redisService: RedisService) { }

  private getOtpKey(type: string, target: string): string {
    return `otp:${type}:${target}`;
  }

  async sendOtp(target: string, type: 'email' | 'sms'): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = this.getOtpKey(type, target);
    const expirySeconds = 180;

    await this.redisService.set(key, code, 'EX', expirySeconds);

    console.log(`[OTP] ${type.toUpperCase()} -> ${target}: ${code}`);
    return code;
  }

  async verifyOtp(target: string, code: string, type: 'email' | 'sms'): Promise<boolean> {
    const key = this.getOtpKey(type, target);

    const storedCode = await this.redisService.get(key);

    if (!storedCode) { throw new BadRequestException('OTP kodu geçersiz veya süresi dolmuş.') }
    if (storedCode !== code) { throw new BadRequestException('Hatalı OTP kodu.') }

    await this.redisService.del(key);

    return true;
  }
}
