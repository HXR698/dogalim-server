import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) { }

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async addItem(userId: string, prodId: string, count: number = 1) {
    if (count <= 0) { throw new BadRequestException('Ürün adeti 0 veya daha küçük olamaz.') }
    const product = await this.prisma.prod.findUnique({ where: { id: prodId } });

    if (!product) { throw new NotFoundException('Sepete eklenmek istenen ürün bulunamadı.') }
    const cartKey = this.getCartKey(userId);

    const existingItemJson = await this.redisService.hget(cartKey, prodId);

    let currentCount = count;
    if (existingItemJson) {
      const existingItem = JSON.parse(existingItemJson);
      currentCount = existingItem.count + count;
    }

    const cartItemData = {
      prodid: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      count: currentCount,
    };

    await this.redisService.hset(cartKey, prodId, JSON.stringify(cartItemData));

    return {
      success: true,
      message: 'Ürün sepete eklendi.',
      data: cartItemData,
    };
  }

  async deleteItem(userId: string, prodId: string) {
    const cartKey = this.getCartKey(userId);
    const exists = await this.redisService.hexists(cartKey, prodId);

    if (!exists) { throw new NotFoundException('Sepette böyle bir ürün bulunamadı.') }

    await this.redisService.hdel(cartKey, prodId);

    return {
      success: true,
      message: 'Ürün sepetten kaldırıldı.',
    };
  }

  async updateItemCount(userId: string, prodId: string, count: number) {
    if (count <= 0) { return this.deleteItem(userId, prodId) }

    const cartKey = this.getCartKey(userId);
    const existingItemJson = await this.redisService.hget(cartKey, prodId);

    if (!existingItemJson) { throw new NotFoundException('Sepette güncellenecek ürün bulunamadı.') }

    const existingItem = JSON.parse(existingItemJson);
    existingItem.count = count;

    await this.redisService.hset(cartKey, prodId, JSON.stringify(existingItem));

    return {
      success: true,
      message: 'Ürün adedi güncellendi.',
      data: existingItem,
    };
  }

  async makeOrder(userId: string, addressId: string, paymentMethod: string) {
    const cartKey = this.getCartKey(userId);
    const cartItemsRaw = await this.redisService.hgetall(cartKey);

    const prodVal = Object.values(cartItemsRaw);
    if (prodVal.length === 0) { throw new BadRequestException('Sepetiniz boş, sipariş oluşturulamaz.') }

    const items = prodVal.map(jsonItem => JSON.parse(jsonItem));
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.count), 0);

    try {
      const newOrder = await this.prisma.$transaction(async (tx): Promise<any> => {
        const order = await tx.orders.create({
          data: {
            userid: userId,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            addressid: addressId,
            status: 'PENDING',
            items: {
              create: items.map(item => ({
                prodid: item.prodid,
                quantity: item.count,
                price: item.price,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        return order;
      });

      await this.redisService.del(cartKey);

      return {
        success: true,
        message: 'Siparişiniz başarıyla oluşturuldu.',
        data: newOrder,
      };
    } catch (error) { throw new InternalServerErrorException('Sipariş oluşturulurken bir hata oluştu.') }
  }

  async getCart(userId: string) {
    const cartKey = this.getCartKey(userId);
    const cartItemsRaw = await this.redisService.hgetall(cartKey);

    const items = Object.values(cartItemsRaw).map(itemJson => JSON.parse(itemJson));
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.count), 0);

    return {
      success: true,
      data: {
        items,
        totalAmount,
        itemCount: items.length,
      },
    };
  }

  async clearCart(userId: string) {
    const cartKey = this.getCartKey(userId);
    await this.redisService.del(cartKey);

    return {
      success: true,
      message: 'Sepet tamamen temizlendi.',
    };
  }
}
