import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hashtagsService.findOne(+id);
  }
}
