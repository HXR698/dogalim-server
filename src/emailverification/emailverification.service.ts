//#region Imports
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
//#endregion

//#region CodeFormat
interface CodeEntry {
  code: string;
  expiresAt: number;
}
//#endregion

@Injectable()
export class EmailVerificationService {
  private codes = new Map<string, CodeEntry>(); // email → code

  //#region Generate Code
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli kod
  }
  //#endregion

  //#region Send Verification Code
  async sendVerificationCode(email: string) {
    const code = this.generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 dakika geçerli

    this.codes.set(email, { code, expiresAt });

    // mailService ile Gmail'e gönder
    await this.mailService.sendMail(email, 'Doğrulama Kodu', `Kodunuz: ${code}`);
  }
  //#endregion

  //#region Verify Code
  verifyCode(email: string, inputCode: string): boolean {
    const entry = this.codes.get(email);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.codes.delete(email);
      return false;
    }
    const isValid = entry.code === inputCode;
    if (isValid) this.codes.delete(email); // Doğruysa bir daha kullanılamasın
    return isValid;
  }
  //#endregion

  //#region Constructor
  constructor(private readonly mailService: MailService) {}
  //#endregion
}
