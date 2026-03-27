import { Controller, Post, Body, Req, Res, UseGuards, Delete, UnauthorizedException, applyDecorators } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenService } from './refresh-token.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SellerRefreshTokenService } from './refresh-token.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

export function Auth(role: 'user' | 'seller') {return applyDecorators(UseGuards(AuthGuard('jwt'), RolesGuard), Roles(role))}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body('deviceId') deviceId: string) {
    const rawRefreshToken = req.cookies?.refreshToken;
    const result = await this.refreshTokenService.rotateRefreshToken(rawRefreshToken, deviceId, req.ip, req.headers['user-agent']);
    res.cookie('refreshToken', result.refreshToken, {httpOnly: true, secure: true, sameSite: 'strict'});
    return { success: true };
  }

  @Auth('user')
  @Delete('logout-device')
  async logoutDevice(@CurrentUser() userId: number, @Body('deviceId') deviceId: string) {
    return this.refreshTokenService.revokeByDevice(userId, deviceId);
  }

  @Auth('user')
  @Delete('logout-all')
  async logoutAll(@CurrentUser() userId: number) {
    return this.refreshTokenService.revokeAllForUser(userId);
  }

  @Auth('user')
  @Post('sessions')
  async sessions(@CurrentUser() userId: number) {
    return this.refreshTokenService.findActiveSessionsByUser(userId);
  }
}


@Controller('seller/auth')
export class SellerAuthController {
  constructor(
    private readonly refreshTokenService: SellerRefreshTokenService,
  ) {}

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body('deviceId') deviceId: string) {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken) throw new UnauthorizedException('Refresh token missing');
    const result = await this.refreshTokenService.rotateRefreshToken(rawRefreshToken, deviceId, req.ip, req.headers['user-agent']);
    res.cookie('refreshToken', result.refreshToken, {httpOnly: true, secure: true, sameSite: 'strict'});
    return { success: true };
  }

  @Auth('seller')
  @Delete('logout-device')
  async logoutDevice(@CurrentUser() userId: number, @Body('deviceId') deviceId: string) {
    return this.refreshTokenService.revokeByDevice(userId, deviceId);
  }

  @Auth('seller')
  @Delete('logout-all')
  async logoutAll(@CurrentUser() userId: number) {
    return this.refreshTokenService.revokeAllForUser(userId);
  }

  @Auth('seller')
  @Post('sessions')
  async sessions(@CurrentUser() userId: number) {
    return this.refreshTokenService.findActiveSessionsByUser(userId);
  }
}