import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  async getCart(@Req() req: any) {
    const userId = req.user.sub;
    return await this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(
    @Req() req: any,
    @Body('prodId') prodId: string,
    @Body('count') count?: number,
  ) {
    const userId = req.user.sub;
    return await this.cartService.addItem(userId, prodId, count);
  }

  @Patch('items/:prodId')
  async updateItemCount(
    @Req() req: any,
    @Param('prodId') prodId: string,
    @Body('count') count: number,
  ) {
    const userId = req.user.sub;
    return await this.cartService.updateItemCount(userId, prodId, count);
  }

  @Delete('items/:prodId')
  async deleteItem(@Req() req: any, @Param('prodId') prodId: string) {
    const userId = req.user.sub;
    return await this.cartService.deleteItem(userId, prodId);
  }

  @Delete()
  async clearCart(@Req() req: any) {
    const userId = req.user.sub;
    return await this.cartService.clearCart(userId);
  }

  @Post('order')
  async makeOrder(
    @Req() req: any,
    @Body('addressId') addressId: string,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    const userId = req.user.sub;
    return await this.cartService.makeOrder(userId, addressId, paymentMethod);
  }
}
