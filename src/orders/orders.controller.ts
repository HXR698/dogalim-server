import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  async getUserOrders(@Req() req: any) {
    const userId = req.user.sub;
    return await this.ordersService.getUserOrders(userId);
  }

  @Get(':id')
  async getOrderDetails(@Req() req: any, @Param('id') orderId: string) {
    const userId = req.user.sub;
    return await this.ordersService.getOrderDetails(orderId, userId);
  }

  @Patch(':id/cancel')
  async cancelOrder(@Req() req: any, @Param('id') orderId: string) {
    const userId = req.user.sub;
    return await this.ordersService.cancelOrder(orderId, userId);
  }

  @Patch(':id/confirm')
  async confirmOrder(@Req() req: any, @Param('id') orderId: string) {
    const sellerId = req.user.sub;
    const userRole = req.user.role; // Servisteki 'SELLER' kontrolü ile uyumlu
    return await this.ordersService.confirmOrder(orderId, sellerId, userRole);
  }
}
