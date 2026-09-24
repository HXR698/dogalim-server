import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.orders.findUnique({ where: { id: orderId } });

    if (!order) { throw new NotFoundException('Sipariş bulunamadı.') }
    if (order.userid !== userId) { throw new ForbiddenException('Bu siparişi iptal etme yetkiniz yok.') }

    try {
      const updatedOrder = await this.prisma.orders.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      return {
        success: true,
        message: 'Sipariş başarıyla iptal edildi.',
        data: updatedOrder,
      };
    } catch (error) { throw new InternalServerErrorException('Sipariş iptal edilirken bir hata oluştu.') }
  }

  async confirmOrder(orderId: string, sellerId: string, userRole: string) {
    if (userRole !== 'SELLER') { throw new ForbiddenException('Bu işlem için yetkiniz yok.') }

    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { sellerid: true },
            },
          },
        },
      },
    });

    if (!order) { throw new NotFoundException('Sipariş bulunamadı.') }

    const isSellerOrder = order.items.some(item => item.product.sellerid === sellerId);
    if (!isSellerOrder) { throw new ForbiddenException('Bu siparişi onaylama yetkiniz yok.') }

    try {
      const updatedOrder = await this.prisma.orders.update({
        where: { id: orderId },
        data: { status: 'PREPARING' },
      });

      return {
        success: true,
        message: 'Sipariş onaylandı ve hazırlanmaya başlandı.',
        data: updatedOrder,
      };
    } catch (error) { throw new InternalServerErrorException('Sipariş onaylanırken bir hata oluştu.') }
  }

  async getOrderDetails(orderId: string, userId: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        payment_method: true,
        addressid: true,
        total_amount: true,
        userid: true,
      },
    });

    if (!order) { throw new NotFoundException('Sipariş bulunamadı.') }
    if (order.userid !== userId) { throw new ForbiddenException('Bu siparişin detaylarını görme yetkiniz yok.') }

    const { userid, ...orderDetails } = order;

    return {
      success: true,
      data: orderDetails,
    };
  }

  async getUserOrders(userId: string) {
    const [activeOrders, pastOrders] = await Promise.all([
      this.prisma.orders.findMany({
        where: { userid: userId },
        include: {
          items: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.lastOrders.findMany({
        where: { userid: userId },
        orderBy: {
          created_at: 'desc',
        },
      }),
    ]);

    return {
      success: true,
      data: {
        activeOrders,
        pastOrders,
      },
    };
  }
}
