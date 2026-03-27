import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Users } from 'src/users/entities/users.entity';

interface JwtUser {
  userid: number;
  email: string;
  role: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() body: { sellerId: number }) {
    return this.followsService.create(user.userid, body.sellerId);
  }

  @Post('user')
  findSomeByUser(@CurrentUser() user: Users, @Body() data: {skp: number, tk: number}) {
    return this.followsService.findSomeByUser(user.id, data.skp, data.tk);
  }

  @Get('seller')
  findAllBySeller(@CurrentUser() sellerId: number) {
    return this.followsService.findAllByUser(sellerId);
  }

  @Get('seller/count') 
  findCountBySeller(@CurrentUser() sellerId: number) {
    return this.followsService.findAllByUser(sellerId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Users, @Param('id', ParseIntPipe) sellerId: number) {
    return this.followsService.exists(user.id, sellerId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: Users, @Param('id', ParseIntPipe) sellerId: number) {
    return this.followsService.remove(user.id, sellerId);
  }
}
