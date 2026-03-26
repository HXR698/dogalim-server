// src/product/product.controller.ts
import { Controller, Body, Post, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../auth/dto/login.dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

//! updated for authorization attacks
//? basic algorithm is done

// ögrenci projesi = done
// startup MVP = done
// kücük SaaS = ek güvenlik gerekir
// büyük production = ek mimari gerekir

interface JwtRequest extends Request {
  user: { userId: number };
}

// Controller way = /users (User) /add &
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService, private readonly authService: AuthService) {}

  @Post('create')
  async addUser(@Body() body: CreateUserDto) {
    return await this.userService.addUser({
      user_name: body.user_name,
      mail_adr: body.mail_adr,
      password: body.password,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getUser(@Req() req: JwtRequest) {

    const user = req.user;

    const userData = await this.userService.findUserById(user.userId);

    return {
      data: {
        id: userData.id,
        name: userData.user_name,
        mail_adr: userData.mail_adr,
      },
    };
  }

  @Post('signin')
  async signin(@Body() body: LoginDto, @Req() req: Request) {
    const data = await this.authService.login({email: body.email, password: body.password, device: {deviceId: body.deviceId, ip: req.ip, userAgent: req.headers['user-agent'] as string}});
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
