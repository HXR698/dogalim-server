import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Controller('email')
export class EmailController {
  constructor(private readonly mailService: MailService) {}

  async sendEmail(@Body() data: { to: string; subject: string; text: string }) {
    return this.mailService.sendMail(data.to, data.subject, data.text);
  }
}
