import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { SellersService } from 'src/sellers/sellers.service';
import { CouriersService } from 'src/couriers/couriers.service';
import { OtpService } from 'src/otp/otp.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as argon2 from '@node-rs/argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly otpService: OtpService,
  ) { }

  private getRefreshTokenKey(userid: string, deviceInfo: string): string {
    return `refresh_token:${userid}:${deviceInfo}`;
  }

  async createRefreshToken(userid: string, deviceInfo: string): Promise<string> {
    const refreshToken = crypto.randomUUID() + '-' + Date.now();
    const key = this.getRefreshTokenKey(userid, deviceInfo);

    const expirySeconds = 30 * 24 * 60 * 60;
    await this.redisService.set(key, refreshToken, 'EX', expirySeconds);

    return refreshToken;
  }

  async deleteTokens(userid: string, refreshToken: string, deviceInfo: string): Promise<void> {
    await this.findValidRefreshToken(userid, refreshToken, deviceInfo);
    const key = this.getRefreshTokenKey(userid, deviceInfo);
    await this.redisService.del(key);
  }

  createAccessToken(userid: string, role: string): string {
    const payload = { sub: userid, role };
    return this.jwtService.sign(payload);
  }

  async findValidRefreshToken(userid: string, refreshToken: string, deviceInfo: string): Promise<boolean> {
    const key = this.getRefreshTokenKey(userid, deviceInfo);
    const storedToken = await this.redisService.get(key);
    if (!storedToken || storedToken !== refreshToken) { throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token.') }

    return true;
  }

  async rotateRefreshToken(userid: string, oldRefreshToken: string, deviceInfo: string) {
    await this.findValidRefreshToken(userid, oldRefreshToken, deviceInfo);
    await this.revokeByDevice(userid, deviceInfo);

    const newAccessToken = this.createAccessToken(userid, 'user');
    const newRefreshToken = await this.createRefreshToken(userid, deviceInfo);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeByDevice(userid: string, deviceInfo: string): Promise<void> {
    const key = this.getRefreshTokenKey(userid, deviceInfo);
    await this.redisService.del(key);
  }

  async login(loginDto: LoginDto, deviceInfo: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) { throw new UnauthorizedException('Geçersiz e-posta veya şifre.') }
    const isPasswordValid = await argon2.verify(user.pass_hash, loginDto.password);
    if (!isPasswordValid) { throw new UnauthorizedException('Geçersiz e-posta veya şifre.') }
    const accessToken = this.createAccessToken(user.id, 'user');
    const refreshToken = await this.createRefreshToken(user.id, deviceInfo);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    const result = await this.userService.addUser(signupDto);
    if (result.success && result.data) { await this.otpService.sendOtp(result.data.email, 'email') }
    return { success: true };
  }
}

@Injectable()
export class SellerAuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly sellerService: SellersService,
  ) { }

  private getRefreshTokenKey(sellerid: string, deviceInfo: string): string {
    return `refresh_token:seller:${sellerid}:${deviceInfo}`;
  }

  async createRefreshToken(sellerid: string, deviceInfo: string): Promise<string> {
    const refreshToken = crypto.randomUUID() + '-' + Date.now();
    const key = this.getRefreshTokenKey(sellerid, deviceInfo);

    const expirySeconds = 30 * 24 * 60 * 60;
    await this.redisService.set(key, refreshToken, 'EX', expirySeconds);

    return refreshToken;
  }

  async deleteTokens(sellerid: string, refreshToken: string, deviceInfo: string): Promise<void> {
    await this.findValidRefreshToken(sellerid, refreshToken, deviceInfo);
    const key = this.getRefreshTokenKey(sellerid, deviceInfo);
    await this.redisService.del(key);
  }

  createAccessToken(sellerid: string, role: string): string {
    const payload = { sub: sellerid, role };
    return this.jwtService.sign(payload);
  }

  async findValidRefreshToken(sellerid: string, refreshToken: string, deviceInfo: string): Promise<boolean> {
    const key = this.getRefreshTokenKey(sellerid, deviceInfo);
    const storedToken = await this.redisService.get(key);
    if (!storedToken || storedToken !== refreshToken) { throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token.') }
    return true;
  }

  async rotateRefreshToken(sellerid: string, oldRefreshToken: string, deviceInfo: string) {
    await this.findValidRefreshToken(sellerid, oldRefreshToken, deviceInfo);
    await this.revokeByDevice(sellerid, deviceInfo);

    const newAccessToken = this.createAccessToken(sellerid, 'seller');
    const newRefreshToken = await this.createRefreshToken(sellerid, deviceInfo);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeByDevice(sellerid: string, deviceInfo: string): Promise<void> {
    const key = this.getRefreshTokenKey(sellerid, deviceInfo);
    await this.redisService.del(key);
  }

  async login(loginDto: any, deviceInfo: string) {
    const seller = await this.prisma.seller.findUnique({ where: { email: loginDto.email } });
    if (!seller) { throw new UnauthorizedException('Geçersiz e-posta veya şifre.') }

    const accessToken = this.createAccessToken(seller.id, 'seller');
    const refreshToken = await this.createRefreshToken(seller.id, deviceInfo);

    return { accessToken, refreshToken };
  }

  async signup(signUpDto: any, deviceInfo: string) {
    const newSeller = await this.sellerService.addSeller(signUpDto);
    if (newSeller.success == true) {
      const accessToken = this.createAccessToken(newSeller.data.id, 'seller');
      const refreshToken = await this.createRefreshToken(newSeller.data.id, deviceInfo);
      return { accessToken, refreshToken };
    } else { throw new NotFoundException() }
  }
}

@Injectable()
export class CouriersAuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly courierService: CouriersService,
  ) { }

  private getRefreshTokenKey(courierid: string, deviceInfo: string): string {
    return `refresh_token:courier:${courierid}:${deviceInfo}`;
  }

  async createRefreshToken(courierid: string, deviceInfo: string): Promise<string> {
    const refreshToken = crypto.randomUUID() + '-' + Date.now();
    const key = this.getRefreshTokenKey(courierid, deviceInfo);

    const expirySeconds = 30 * 24 * 60 * 60;
    await this.redisService.set(key, refreshToken, 'EX', expirySeconds);

    return refreshToken;
  }

  async deleteTokens(courierid: string, refreshToken: string, deviceInfo: string): Promise<void> {
    await this.findValidRefreshToken(courierid, refreshToken, deviceInfo);
    const key = this.getRefreshTokenKey(courierid, deviceInfo);
    await this.redisService.del(key);
  }

  createAccessToken(courierid: string, role: string): string {
    const payload = { sub: courierid, role };
    return this.jwtService.sign(payload);
  }

  async findValidRefreshToken(courierid: string, refreshToken: string, deviceInfo: string): Promise<boolean> {
    const key = this.getRefreshTokenKey(courierid, deviceInfo);
    const storedToken = await this.redisService.get(key);
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token.');
    }
    return true;
  }

  async rotateRefreshToken(courierid: string, oldRefreshToken: string, deviceInfo: string) {
    await this.findValidRefreshToken(courierid, oldRefreshToken, deviceInfo);
    await this.revokeByDevice(courierid, deviceInfo);

    const newAccessToken = this.createAccessToken(courierid, 'courier');
    const newRefreshToken = await this.createRefreshToken(courierid, deviceInfo);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeByDevice(courierid: string, deviceInfo: string): Promise<void> {
    const key = this.getRefreshTokenKey(courierid, deviceInfo);
    await this.redisService.del(key);
  }

  async login(loginDto: any, deviceInfo: string) {
    const courier = await this.prisma.couriers.findUnique({ where: { email: loginDto.email } });
    if (!courier) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    // Argon2 ile şifre doğrulama
    const isPasswordValid = await argon2.verify(courier.pass_hash, loginDto.pass);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const accessToken = this.createAccessToken(courier.id, 'courier');
    const refreshToken = await this.createRefreshToken(courier.id, deviceInfo);

    return { accessToken, refreshToken, courier: { id: courier.id, name: courier.name, email: courier.email } };
  }

  async signup(signUpDto: any, deviceInfo: string) {
    // Eğer şifre hashleme işlemi servisin içinde yapılacaksa:
    // signUpDto.pass_hash = await argon2.hash(signUpDto.pass);

    const newCourier = await this.courierService.addCourier(signUpDto);
    if (newCourier.success == true) {
      const accessToken = this.createAccessToken(newCourier.data.id, 'courier');
      const refreshToken = await this.createRefreshToken(newCourier.data.id, deviceInfo);
      return { accessToken, refreshToken, courier: newCourier.data };
    } else {
      throw new NotFoundException();
    }
  }
}
