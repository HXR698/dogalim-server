import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) { }

  @Post(':sellerId')
  async addFollow(@Req() req: any, @Param('sellerId') sellerId: string) {
    const userId = req.user.sub; // Token'dan gelen kullanıcı ID'si
    return await this.followsService.addFollow(userId, sellerId);
  }

  @Delete(':sellerId')
  async deleteFollow(@Req() req: any, @Param('sellerId') sellerId: string) {
    const userId = req.user.sub;
    return await this.followsService.deleteFollow(userId, sellerId);
  }

  @Get(':sellerId/status')
  async checkStatus(@Req() req: any, @Param('sellerId') sellerId: string) {
    const userId = req.user.sub;
    return await this.followsService.checkStatus(userId, sellerId);
  }
}
