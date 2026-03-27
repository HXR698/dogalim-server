import { Controller, Get, Req, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto/login.dto';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService, private readonly authService: AuthService) {}

  @Post("create")
  createSeller(@Body() body: CreateSellerDto) {
    return this.sellersService.create(body);
  }

  // @UseGuards(AuthGuard('jwt')) // kullaniciya özel filtreleme yapilmasi düsünülürse
  @Get("trends")
  getTrends() {
    return this.sellersService.findTrends();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateSeller(@Body() body: UpdateSellerDto, @CurrentUser() user: any) {
    return this.sellersService.update(user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  removeSeller(@CurrentUser('id') userId: number) {
    return this.sellersService.remove(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getSeller(@CurrentUser('id') userId: number) {
    return this.sellersService.findOne(userId);
  }

  @Post('signin')
  async signin(@Body() body: LoginDto, @Req() req: Request) {
    const data = await this.authService.sellerlogin({email: body.email, password: body.password, device: {deviceId: body.deviceId, ip: req.ip, userAgent: req.headers['user-agent'] as string}});
    return {
      data: {
        id: data.userData?.id,
        name: data.userData?.user_name,
        mail_adr: data.userData?.mail_adr,
      },
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken
    };
  }
}
