import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { RefreshToken, SellerRefreshToken } from './entities/refresh-token.entity';
import { CreateRefreshTokenDto, CreateSellerRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto, UpdateSellerRefreshTokenDto } from './dto/update-refresh-token.dto';
import { ActiveSessionDto, SellerActiveSessionDto } from './dto/active-session.dto';
import * as crypto from 'crypto';

//? can use cron task for cleanup expired tokens

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {/*console.log(refreshTokenRepo)*/}

  async create(userId: number, dto: CreateRefreshTokenDto): Promise<RefreshToken> {
    const exists = await this.refreshTokenRepo.findOne({where: { refreshToken: dto.refreshToken }});

    if (exists) throw new ConflictException('Refresh token already exists');

    await this.refreshTokenRepo.update({user: {id: userId}, deviceid: dto.deviceid, revoked: false}, {revoked: true, revokedat: new Date()});

    const refreshToken = this.refreshTokenRepo.create({
      refreshToken: dto.refreshToken,
      user: {id: userId},
      deviceid: dto.deviceid,
      ipadress: dto.ipadress,
      useragent: dto.useragent,
      expiresat: dto.expiresat,
      revoked: false,
    });

    return await this.refreshTokenRepo.save(refreshToken);
  }

  async findValidRefreshToken(plainToken: string, deviceid: string, /*ipaddress?: string*/): Promise<RefreshToken> {
    const hashedToken = this.hashRefreshToken(plainToken);
    const tokenRow = await this.refreshTokenRepo.findOne({where: { refreshToken: hashedToken }});

    if (!tokenRow) throw new UnauthorizedException('Invalid refresh token');
    if (tokenRow.revoked) throw new UnauthorizedException('Refresh token revoked');
    if (tokenRow.expiresat.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired');
    if (tokenRow.deviceid !== deviceid) throw new UnauthorizedException('Device mismatch');
    /*if (ipaddress && tokenRow.ipadress && tokenRow.ipadress !== ipaddress) {
      throw new UnauthorizedException('IP mismatch');
    }*/
    return tokenRow;
  }

  async updateByToken(hashedToken: string, dto: UpdateRefreshTokenDto): Promise<void> {
    const updateData: any = {};
    if (dto.revoked !== undefined) {
      updateData.revoked = dto.revoked;
      if (dto.revoked === true) updateData.revokedat = new Date();
    }
    if (dto.ipadress !== undefined) updateData.ipadress = dto.ipadress;
    if (dto.useragent !== undefined) updateData.useragent = dto.useragent;
    const result = await this.refreshTokenRepo.update({ refreshToken: hashedToken }, updateData);
    if (result.affected === 0) throw new NotFoundException('Refresh token not found');
  }

  async rotateRefreshToken(rawRefreshToken: string, deviceId: string, ipAddress?: string, userAgent?: string,) {
    const hashedToken = this.hashRefreshToken(rawRefreshToken);
    const token = await this.refreshTokenRepo.findOne({where: { refreshToken: hashedToken }});

    if (!token) throw new UnauthorizedException('Invalid refresh token');
    if (token.revoked) {
      await this.revokeAllUserTokens(token.user.id);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    if (token.expiresat < new Date()) throw new UnauthorizedException('Refresh token expired');
    if (token.deviceid !== deviceId) throw new UnauthorizedException('Device mismatch');

    await this.refreshTokenRepo.update({ id: token.id }, {revoked: true, revokedat: new Date()});
    const newRawToken = crypto.randomBytes(64).toString('hex');
    const newHashedToken = this.hashRefreshToken(newRawToken);
    await this.refreshTokenRepo.insert({
      refreshToken: newHashedToken,
      user: {id: token.user.id},
      deviceid: token.deviceid,
      ipadress: ipAddress ?? token.ipadress,
      useragent: userAgent ?? token.useragent,
      expiresat: this.addDays(30),
    });

    return {refreshToken: newRawToken};
  }

  async revokeByDevice(userId: number, deviceid: string): Promise<{ revokedCount: number }> {
    const result = await this.refreshTokenRepo.update({user: {id: userId}, deviceid, revoked: false}, {revoked: true, revokedat: new Date()});
    return {revokedCount: result.affected ?? 0};
  }

  async revokeAllForUser(userId: number): Promise<{ revokedCount: number }> {
    const result = await this.refreshTokenRepo.update({user: {id: userId}, revoked: false}, {revoked: true, revokedat: new Date()});
    return {revokedCount: result.affected ?? 0};
  }

  async findActiveSessionsByUser(userId: number): Promise<ActiveSessionDto[]> {
    const now = new Date();
    return await this.refreshTokenRepo.find({where: {user: {id: userId}, revoked: false, expiresat: MoreThan(now)}, select: ['id', 'deviceid', 'ipadress', 'useragent', 'expiresat'], order: {expiresat: 'DESC'}});
  }

  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    const now = new Date();
    const result = await this.refreshTokenRepo.delete({expiresat: LessThan(now)});
    return {deletedCount: result.affected ?? 0};
  }

  private addDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  private async revokeAllUserTokens(userId: number) {
    await this.refreshTokenRepo.update({ user: {id: userId}, revoked: false }, { revoked: true, revokedat: new Date() });
  }
}


@Injectable()
export class SellerRefreshTokenService {
  constructor(
    @InjectRepository(SellerRefreshToken)
    private readonly refreshTokenRepo: Repository<SellerRefreshToken>,
  ) {/*console.log(refreshTokenRepo)*/}

  async create(sellerId: number, dto: CreateSellerRefreshTokenDto): Promise<SellerRefreshToken> {
    const exists = await this.refreshTokenRepo.findOne({where: { refreshToken: dto.refreshToken }});

    if (exists) throw new ConflictException('Refresh token already exists');

    await this.refreshTokenRepo.update({seller: {id: sellerId}, deviceid: dto.deviceid, revoked: false}, {revoked: true, revokedat: new Date()});

    const refreshToken = this.refreshTokenRepo.create({
      refreshToken: dto.refreshToken,
      seller: {id: sellerId},
      deviceid: dto.deviceid,
      ipadress: dto.ipadress,
      selleragent: dto.selleragent,
      expiresat: dto.expiresat,
      revoked: false,
    });

    return await this.refreshTokenRepo.save(refreshToken);
  }

  async findValidRefreshToken(plainToken: string, deviceid: string, /*ipaddress?: string*/): Promise<SellerRefreshToken> {
    const hashedToken = this.hashRefreshToken(plainToken);
    const tokenRow = await this.refreshTokenRepo.findOne({where: { refreshToken: hashedToken }});

    if (!tokenRow) throw new UnauthorizedException('Invalid refresh token');
    if (tokenRow.revoked) throw new UnauthorizedException('Refresh token revoked');
    if (tokenRow.expiresat.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired');
    if (tokenRow.deviceid !== deviceid) throw new UnauthorizedException('Device mismatch');
    /*if (ipaddress && tokenRow.ipadress && tokenRow.ipadress !== ipaddress) {
      throw new UnauthorizedException('IP mismatch');
    }*/
    return tokenRow;
  }

  async updateByToken(hashedToken: string, dto: UpdateSellerRefreshTokenDto): Promise<void> {
    const updateData: any = {};
    if (dto.revoked !== undefined) {
      updateData.revoked = dto.revoked;
      if (dto.revoked === true) updateData.revokedat = new Date();
    }
    if (dto.ipadress !== undefined) updateData.ipadress = dto.ipadress;
    if (dto.selleragent !== undefined) updateData.useragent = dto.selleragent;
    const result = await this.refreshTokenRepo.update({ refreshToken: hashedToken }, updateData);
    if (result.affected === 0) throw new NotFoundException('Refresh token not found');
  }

  async rotateRefreshToken(rawRefreshToken: string, deviceId: string, ipAddress?: string, sellerAgent?: string,) {
    const hashedToken = this.hashRefreshToken(rawRefreshToken);
    const token = await this.refreshTokenRepo.findOne({where: { refreshToken: hashedToken }});

    if (!token) throw new UnauthorizedException('Invalid refresh token');
    if (token.revoked) {
      await this.revokeAllUserTokens(token.seller.id);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    if (token.expiresat < new Date()) throw new UnauthorizedException('Refresh token expired');
    if (token.deviceid !== deviceId) throw new UnauthorizedException('Device mismatch');

    await this.refreshTokenRepo.update({ id: token.id }, {revoked: true, revokedat: new Date()});
    const newRawToken = crypto.randomBytes(64).toString('hex');
    const newHashedToken = this.hashRefreshToken(newRawToken);
    await this.refreshTokenRepo.insert({
      refreshToken: newHashedToken,
      seller: {id: token.seller.id},
      deviceid: token.deviceid,
      ipadress: ipAddress ?? token.ipadress,
      selleragent: sellerAgent ?? token.selleragent,
      expiresat: this.addDays(30),
    });

    return {refreshToken: newRawToken};
  }

  async revokeByDevice(sellerId: number, deviceid: string): Promise<{ revokedCount: number }> {
    const result = await this.refreshTokenRepo.update({seller: {id: sellerId}, deviceid, revoked: false}, {revoked: true, revokedat: new Date()});
    return {revokedCount: result.affected ?? 0};
  }

  async revokeAllForUser(sellerId: number): Promise<{ revokedCount: number }> {
    const result = await this.refreshTokenRepo.update({seller: {id: sellerId}, revoked: false}, {revoked: true, revokedat: new Date()});
    return {revokedCount: result.affected ?? 0};
  }

  async findActiveSessionsByUser(sellerId: number): Promise<SellerActiveSessionDto[]> {
    const now = new Date();
    return await this.refreshTokenRepo.find({where: {seller: {id: sellerId}, revoked: false, expiresat: MoreThan(now)}, select: ['id', 'deviceid', 'ipadress', 'selleragent', 'expiresat'], order: {expiresat: 'DESC'}});
  }

  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    const now = new Date();
    const result = await this.refreshTokenRepo.delete({expiresat: LessThan(now)});
    return {deletedCount: result.affected ?? 0};
  }

  private addDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  private async revokeAllUserTokens(sellerId: number) {
    await this.refreshTokenRepo.update({ seller: {id: sellerId}, revoked: false }, { revoked: true, revokedat: new Date() });
  }
}
