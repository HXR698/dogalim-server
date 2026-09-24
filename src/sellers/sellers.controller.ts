import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateSellerCommentDto } from './dto/create-seller-comment.dto';
import { UpdateSellerCommentDto } from './dto/update-seller-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) { }

  @Post()
  async addSeller(@Body() createSellerDto: CreateSellerDto) {
    return await this.sellersService.addSeller(createSellerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSeller(@Param('id') sellerId: string, @Req() req: any) {
    const requester = {
      id: req.user.sub,
      role: req.user.role,
    };
    return await this.sellersService.getSeller(sellerId, requester);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateSeller(@Req() req: any, @Body() updateSellerDto: UpdateSellerDto) {
    const sellerId = req.user.sub; // Token'dan gelen satıcı ID'si
    return await this.sellersService.updateSeller(sellerId, updateSellerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteSeller(@Req() req: any) {
    const sellerId = req.user.sub;
    return await this.sellersService.deleteSeller(sellerId);
  }

  @Get(':id/comments')
  async getComments(@Param('id') sellerId: string) {
    return await this.sellersService.getComments(sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id') sellerId: string,
    @Body() createCommentDto: CreateSellerCommentDto,
  ) {
    const userId = req.user.sub;
    return await this.sellersService.addComment(userId, sellerId, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/comments')
  async updateComment(
    @Req() req: any,
    @Param('id') sellerId: string,
    @Body() updateCommentDto: UpdateSellerCommentDto,
  ) {
    const userId = req.user.sub;
    return await this.sellersService.updateComment(userId, sellerId, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/comments')
  async deleteComment(@Req() req: any, @Param('id') sellerId: string) {
    const userId = req.user.sub;
    return await this.sellersService.deleteComment(userId, sellerId);
  }
}
