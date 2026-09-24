import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from "@node-rs/argon2";

@Injectable()
export class CouriersService {
  constructor(private readonly prisma: PrismaService) { }

  async addCourier(dto: { name: string; phone: string; email: string; pass: string; vehicle_type: string }) {
    const existingCourier = await this.prisma.couriers.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingCourier) { throw new ConflictException('Bu e-posta veya telefon numarası zaten kullanımda.') }

    const pass_hash = await argon2.hash(dto.pass);

    const newCourier = await this.prisma.couriers.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        pass_hash,
        vehicle_type: dto.vehicle_type,
        is_active: true,
      },
    });

    return {
      success: true,
      message: 'Kurye başarıyla oluşturuldu.',
      data: {
        id: newCourier.id,
        name: newCourier.name,
        email: newCourier.email,
        phone: newCourier.phone,
        vehicle_type: newCourier.vehicle_type,
      },
    };
  }

  async updateCourier(courierId: string, dto: { name?: string; phone?: string; vehicle_type?: string; is_active?: boolean; pass?: string }) {
    const courier = await this.prisma.couriers.findUnique({
      where: { id: courierId },
    });

    if (!courier) { throw new NotFoundException('Kurye bulunamadı.') }

    const updateData: any = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.vehicle_type) updateData.vehicle_type = dto.vehicle_type;
    if (typeof dto.is_active === 'boolean') updateData.is_active = dto.is_active;

    if (dto.pass) { updateData.pass_hash = await argon2.hash(dto.pass) }

    const updated = await this.prisma.couriers.update({
      where: { id: courierId },
      data: updateData,
    });

    return {
      success: true,
      message: 'Kurye bilgileri güncellendi.',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        vehicle_type: updated.vehicle_type,
        is_active: updated.is_active,
      },
    };
  }

  async deleteCourier(courierId: string) {
    const courier = await this.prisma.couriers.findUnique({
      where: { id: courierId },
    });

    if (!courier) { throw new NotFoundException('Kurye bulunamadı.') }

    await this.prisma.couriers.delete({ where: { id: courierId } });

    return {
      success: true,
      message: 'Kurye sistemden silindi.',
    };
  }

  async getCourier(courierId: string) {
    const courier = await this.prisma.couriers.findUnique({
      where: { id: courierId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        vehicle_type: true,
        is_active: true,
        today_distance: true,
        active_seconds: true,
      },
    });

    if (!courier) { throw new NotFoundException('Kurye bulunamadı.') }

    return {
      success: true,
      data: courier,
    };
  }

  async updateCourierLocation(courierId: string, latitude: number, longitude: number) {
    const pointWkt = `SRID=4326;POINT(${longitude} ${latitude})`;

    await this.prisma.$executeRaw`
    UPDATE "Couriers"
    SET location = ST_GeogFromText(${pointWkt})
    WHERE id = ${courierId}
  `;

    return { success: true, message: 'Konum güncellendi.' };
  }

  async assignNearestOrderToCourier(courierId: string, maxDistanceMeters: number = 10000) {
    const courier = await this.prisma.couriers.findUnique({
      where: { id: courierId },
      select: { id: true, is_active: true },
    });

    if (!courier || !courier.is_active) { throw new NotFoundException('Aktif kurye bulunamadı.') }

    const nearbyOrders: any[] = await this.prisma.$queryRaw`
    Select o.*, 
           ST_Distance(c.location, a.location) as distance
    FROM "Orders" o
    JOIN "Addresses" a ON o.addressid = a.id
    JOIN "Couriers" c ON c.id = ${courierId}
    WHERE o.courierid IS NULL 
      AND o.status = 'PREPARING'
      AND c.location IS NOT NULL
      AND a.location IS NOT NULL
      AND ST_DWithin(c.location, a.location, ${maxDistanceMeters})
    ORDER BY distance ASC
    LIMIT 1;
  `;

    if (!nearbyOrders || nearbyOrders.length === 0) { throw new NotFoundException(`Belirlenen ${maxDistanceMeters / 1000} km yarıçapında uygun sipariş bulunamadı.`) }

    const nearestOrder = nearbyOrders[0];

    const updatedOrder = await this.prisma.orders.update({
      where: { id: nearestOrder.id },
      data: {
        courierid: courierId,
        status: 'WAITING',
      },
    });

    return {
      success: true,
      message: `En yakın sipariş (${Number(nearestOrder.distance).toFixed(0)} metre mesafede) kuryeye atandı.`,
      data: {
        ...updatedOrder,
        distanceMeters: Number(nearestOrder.distance),
      },
    };
  }

  async getCourierOrders(courierId: string) {
    const orders = await this.prisma.orders.findMany({
      where: { courierid: courierId },
      include: {
        address: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      success: true,
      data: orders,
    };
  }

  async orderDelivered(courierId: string, orderId: string) {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, courierid: courierId },
    });

    if (!order) { throw new NotFoundException('Sipariş bulunamadı veya bu kuryeye atanmamış.') }

    const updatedOrder = await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
      },
    });

    return {
      success: true,
      message: 'Sipariş başarıyla teslim edildi.',
      data: updatedOrder,
    };
  }

  async orderCanceled(orderId: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) { throw new NotFoundException('Sipariş bulunamadı.') }

    const updatedOrder = await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        courierid: null,
      },
    });

    return {
      success: true,
      message: 'Sipariş iptal edildi ve kurye serbest bırakıldı.',
      data: updatedOrder,
    };
  }

  async pickedUpOrder(courierId: string, orderId: string) {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, courierid: courierId },
    });

    if (!order) { throw new NotFoundException('Sipariş bulunamadı veya bu kuryeye atanmamış.') }

    const updatedOrder = await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'PICKED_UP',
      },
    });

    return {
      success: true,
      message: 'Sipariş restorandan teslim alındı, yola çıkıldı.',
      data: updatedOrder,
    };
  }
}
