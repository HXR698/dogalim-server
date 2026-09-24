import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FavprodsService } from './favprods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favprods')
@UseGuards(JwtAuthGuard)
export class FavprodsController {
  constructor(private readonly favprodsService: FavprodsService) { }

  @Post(':prodId')
  async addFavProd(@Req() req: any, @Param('prodId') prodId: string) {
    const userId = req.user.sub; // Token'dan gelen kullanıcı ID'si
    return await this.favprodsService.addFavProd(userId, prodId);
  }

  @Delete(':prodId')
  async deleteFavProd(@Req() req: any, @Param('prodId') prodId: string) {
    const userId = req.user.sub;
    return await this.favprodsService.deleteFavProd(userId, prodId);
  }

  @Get(':prodId/status')
  async checkStatus(@Req() req: any, @Param('prodId') prodId: string) {
    const userId = req.user.sub;
    return await this.favprodsService.checkStatus(userId, prodId);
  }
}
