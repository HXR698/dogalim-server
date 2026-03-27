import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SCommService } from './s-comm.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSCommDto } from './dto/create-s-comm.dto';
import { UpdateSCommDto } from './dto/update-s-comm.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('s-comm')
export class SCommController {
  constructor(private readonly sCommService: SCommService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createComm(@CurrentUser('id') userId: number, @Body() body: CreateSCommDto) {
    return this.sCommService.create(userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updateComm(@Param('id', ParseIntPipe) reviewId: number, @Body() body: UpdateSCommDto, @CurrentUser('id') userId: number) {
    return this.sCommService.update(reviewId, userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  removeComm(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) reviewId: number) {
    return this.sCommService.remove(userId, reviewId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('seller/:sellerId')
  getComm(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.sCommService.findAllBySellerId(sellerId);
  }
}
