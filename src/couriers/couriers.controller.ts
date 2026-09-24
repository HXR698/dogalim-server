import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { CouriersAuthService } from 'src/auth/auth.service';

@Controller('couriers')
export class CouriersController {
  constructor(
    private readonly couriersService: CouriersService,
    private readonly couriersAuthService: CouriersAuthService,
  ) { }

  @Post('auth/signup')
  async signup(@Body() body: any, @Req() req: any) {
    const deviceInfo = req.headers['user-agent'] || 'unknown-device';
    return this.couriersAuthService.signup(body, deviceInfo);
  }

  @Post('auth/login')
  async login(@Body() body: any, @Req() req: any) {
    const deviceInfo = req.headers['user-agent'] || 'unknown-device';
    return this.couriersAuthService.login(body, deviceInfo);
  }

  @Get(':id')
  async getCourier(@Param('id') id: string) {
    return this.couriersService.getCourier(id);
  }

  @Put(':id')
  async updateCourier(@Param('id') id: string, @Body() body: any) {
    return this.couriersService.updateCourier(id, body);
  }

  @Delete(':id')
  async deleteCourier(@Param('id') id: string) {
    return this.couriersService.deleteCourier(id);
  }

  @Get(':id/orders')
  async getCourierOrders(@Param('id') id: string) {
    return this.couriersService.getCourierOrders(id);
  }

  @Put(':id/orders/:orderId/picked-up')
  async pickedUpOrder(@Param('id') courierId: string, @Param('orderId') orderId: string) {
    return this.couriersService.pickedUpOrder(courierId, orderId);
  }

  @Put(':id/orders/:orderId/delivered')
  async orderDelivered(@Param('id') courierId: string, @Param('orderId') orderId: string) {
    return this.couriersService.orderDelivered(courierId, orderId);
  }
}
