import { Controller, Get, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post("create")
  createSeller(@Body() body: CreateSellerDto) {
    return this.sellersService.create(body);
  }

  // @UseGuards(AuthGuard('jwt')) // kullaniciya özel filtreleme yapilmasi düsünülürse
  @Get("trends")
  getTrends() {
    return this.sellersService.findTrends();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateSeller(@Body() body: UpdateSellerDto, @CurrentUser() user: any) {
    return this.sellersService.update(user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  removeSeller(@CurrentUser('id') userId: number) {
    return this.sellersService.remove(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getSeller(@CurrentUser('id') userId: number) {
    return this.sellersService.findOne(userId);
  }
}
