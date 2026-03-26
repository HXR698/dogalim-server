import { Controller, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body() body: any, @Req() req: Request) {
    const { email, password } = body;
    const tokens = await this.authService.signin(email, password, {deviceId: req.headers['x-device-id'] as string, userAgent: req.headers['user-agent'], ip: req.ip});
    if (!tokens) throw new UnauthorizedException('Invalid credentials');
    return tokens;
  }
}
