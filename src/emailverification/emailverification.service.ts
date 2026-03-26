import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

interface CodeEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class EmailVerificationService {
  constructor(private readonly mailService: MailService) {/*console.log(MailService)*/}
  private codes = new Map<string, CodeEntry>();

  async sendVerificationCode(email: string) {
    const code = this.generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 dakika gecerli

    this.codes.set(email, { code, expiresAt });

    await this.mailService.sendMail(email, 'Doğrulama Kodu', `Kodunuz: ${code}`);
  }

  verifyCode(email: string, inputCode: string) {
    const entry = this.codes.get(email);
    if (!entry) return {success: false};
    if (Date.now() > entry.expiresAt) {
      this.codes.delete(email);
      return {success: false};
    }
    if (entry.code === inputCode) this.codes.delete(email);
    return {success: true};
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli kod rng si
  }
}
