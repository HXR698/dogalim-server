import { Controller, Get, Body, Post, UseGuards, Patch, Delete, ParseIntPipe, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-dto.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@CurrentUser('id') userId: number, @Body() data: CreateCartItemDto) {
    return this.cartService.addCartItem(userId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('increase/:id')
  increaseProd(@Param('id', ParseIntPipe) prodId: number, @CurrentUser('id') userId: number) {
    return this.cartService.updateQuantity(userId, prodId, true);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('decrease/:id')
  decreaseProd(@Param('id', ParseIntPipe) prodId: number, @CurrentUser('id') userId: number) {
    return this.cartService.updateQuantity(userId, prodId, true);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  removeProd(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) prodId: number) {
    return this.cartService.deleteCartItem(userId, prodId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProd(@Param('prodId', ParseIntPipe) userId: number) {
    return this.cartService.getUsersCartItems(userId);
  }
}
