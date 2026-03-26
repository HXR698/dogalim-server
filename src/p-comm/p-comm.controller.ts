import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PCommService } from './p-comm.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePCommDto } from './dto/create-p-comm.dto';
import { UpdatePCommDto } from './dto/update-p-comm.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('p-comm')
export class PCommController {
  constructor(private readonly pCommService: PCommService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@CurrentUser() userId: number, @Body() createPCommDto: CreatePCommDto) {
    return this.pCommService.create(userId, createPCommDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id', ParseIntPipe) prodId: number, @Body() updatePCommDto: UpdatePCommDto, @CurrentUser() userId: number) {
    return this.pCommService.update(prodId, userId, updatePCommDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) prodId: number, @CurrentUser() userId: number) {
    return this.pCommService.remove(userId, prodId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) prodId: number) {
    return this.pCommService.findAllByProdId(prodId);
  }
}
