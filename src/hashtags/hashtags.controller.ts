import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) { }

  @Get(':type/:hashtagName')
  async getByHashtag(
    @Param('type') type: 'seller' | 'prod',
    @Param('hashtagName') hashtagName: string,
  ) {
    return await this.hashtagsService.getByHashtag(type, hashtagName);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':type/:targetId')
  async addHashtag(
    @Param('type') type: 'seller' | 'prod',
    @Param('targetId') targetId: string,
    @Body('hashtagName') hashtagName: string,
  ) {
    return await this.hashtagsService.addHashtag(type, targetId, hashtagName);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':type/:targetId')
  async deleteHashtag(
    @Param('type') type: 'seller' | 'prod',
    @Param('targetId') targetId: string,
    @Body('hashtagName') hashtagName: string,
  ) {
    return await this.hashtagsService.deleteHashtag(type, targetId, hashtagName);
  }
}
