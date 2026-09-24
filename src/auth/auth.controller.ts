import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SellerAuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sellerAuthService: SellerAuthService,
  ) { }

  @Post('user/signup')
  async signupUser(@Body() dto: SignupDto) {
    return await this.authService.signup(dto);
  }

  @Post('user/login')
  async loginUser(@Body() dto: LoginDto, @Headers('user-agent') deviceInfo: string) {
    return await this.authService.login(dto, deviceInfo || 'unknown-device');
  }

  @Post('user/refresh')
  async refreshUserToken(
    @Body() body: { userId: string; refreshToken: string },
    @Headers('user-agent') deviceInfo: string,
  ) {
    return await this.authService.rotateRefreshToken(
      body.userId,
      body.refreshToken,
      deviceInfo || 'unknown-device',
    );
  }

  @Post('seller/signup')
  async signupSeller(@Body() dto: any, @Headers('user-agent') deviceInfo: string) {
    return await this.sellerAuthService.signup(dto, deviceInfo || 'unknown-device');
  }

  @Post('seller/login')
  async loginSeller(@Body() dto: any, @Headers('user-agent') deviceInfo: string) {
    return await this.sellerAuthService.login(dto, deviceInfo || 'unknown-device');
  }

  @Post('seller/refresh')
  async refreshSellerToken(
    @Body() body: { userId: string; refreshToken: string },
    @Headers('user-agent') deviceInfo: string,
  ) {
    return await this.sellerAuthService.rotateRefreshToken(
      body.userId,
      body.refreshToken,
      deviceInfo || 'unknown-device',
    );
  }
}
