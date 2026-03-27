import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LikedProdsService } from './liked-prods.service';
import { CreateLikedProdsDto } from './dto/create-liked-prod.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user')
@Controller('liked-prods')
export class LikedProdsController {
  constructor(private readonly likedProdsService: LikedProdsService) {}

  @Post()
  create(@CurrentUser() userId: number, @Body() createLikedProdDto: CreateLikedProdsDto) {
    return this.likedProdsService.create(userId, createLikedProdDto);
  }

  @Get()
  findAll(@CurrentUser() userId: number) {
    return this.likedProdsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@CurrentUser() userId: number, @Param('id', ParseIntPipe) prodId: number) {
    return this.likedProdsService.exists(userId, prodId);
  }

  @Delete(':id')
  remove(@CurrentUser() userId: number, @Param('id', ParseIntPipe) prodId: number) {
    return this.likedProdsService.remove(userId, prodId);
  }
}
