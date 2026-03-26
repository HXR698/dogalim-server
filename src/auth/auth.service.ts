import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { CreateRefreshTokenDto } from '../refresh-token/dto/create-refresh-token.dto';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService, private readonly refreshTokenService: RefreshTokenService) {/*console.log({ JwtService, UsersService, RefreshTokenService })*/}

  async signin(email: string, password: string, context: {deviceId?: string, userAgent?: string, ip?: string}) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    if (!await argon2.verify(user.password, password)) throw new UnauthorizedException();

    //! RS256
    const accessToken = this.jwtService.sign({sub: user.id, email: user.mail_adr, role: 'user'});

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const createRefreshTokenDto: CreateRefreshTokenDto = {
      refreshToken: refreshHash,
      deviceid: context.deviceId ?? 'unknown',
      ipadress: context.ip,
      useragent: context.userAgent,
      expiresat: expiresAt,
    };

    await this.refreshTokenService.create(user.id, createRefreshTokenDto);

    return {accessToken, refreshToken};
  }

  async login(params: {email: string, password: string, device?: {deviceId?: string, ip?: string, userAgent?: string}}) {
    const user = await this.usersService.findByEmail(params.email);
    const tokens = await this.signin(params.email, params.password, {deviceId: params.device?.deviceId, userAgent: params.device?.userAgent, ip: params.device?.ip});
    return {userData: user, tokens: tokens};
  }
}
