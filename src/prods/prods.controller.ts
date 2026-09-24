import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProdsService } from './prods.service';
import { CreateProdDto } from './dto/create-prod.dto';
import { UpdateProdDto } from './dto/update-prod.dto';
import { CreateProdCommDto } from './dto/create-prod-comment.dto';
import { UpdateProdCommDto } from './dto/update-prod-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('prods')
export class ProdsController {
  constructor(private readonly prodsService: ProdsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addProd(@Req() req: any, @Body() createProdDto: CreateProdDto) {
    const sellerId = req.user.sub;
    return await this.prodsService.addProd(sellerId, createProdDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProd(
    @Req() req: any,
    @Param('id') productId: string,
    @Body() updateProdDto: UpdateProdDto,
  ) {
    const sellerId = req.user.sub;
    return await this.prodsService.updateProd(sellerId, productId, updateProdDto);
  }

  @Get(':id')
  async getProd(@Param('id') productId: string) {
    return await this.prodsService.getProd(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProd(@Req() req: any, @Param('id') productId: string) {
    const sellerId = req.user.sub;
    return await this.prodsService.deleteProd(sellerId, productId);
  }

  @Get(':id/comments')
  async getProdComments(@Param('id') productId: string) {
    return await this.prodsService.getProdComments(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addProdComm(
    @Req() req: any,
    @Param('id') productId: string,
    @Body() createProdCommDto: CreateProdCommDto,
  ) {
    const userId = req.user.sub;
    return await this.prodsService.addProdComm(userId, productId, createProdCommDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/comments')
  async updateProdComm(
    @Req() req: any,
    @Param('id') productId: string,
    @Body() updateProdCommDto: UpdateProdCommDto,
  ) {
    const userId = req.user.sub;
    return await this.prodsService.updateProdComm(userId, productId, updateProdCommDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/comments')
  async deleteProdComm(@Req() req: any, @Param('id') productId: string) {
    const userId = req.user.sub;
    return await this.prodsService.deleteProdComm(userId, productId);
  }
}
