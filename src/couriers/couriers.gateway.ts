import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CouriersService } from './couriers.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'courier',
})
export class CourierGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly couriersService: CouriersService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      if (payload.role !== 'courier') {
        client.disconnect();
        return;
      }

      client.data.courierId = payload.sub;
      client.join(`courier_${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) { }

  @SubscribeMessage('updateLocation')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { latitude: number; longitude: number },
  ) {
    const courierId = client.data.courierId;
    if (!courierId) return { success: false, message: 'Yetkisiz bağlantı.' };

    await this.couriersService.updateCourierLocation(
      courierId,
      data.latitude,
      data.longitude,
    );

    return { event: 'locationUpdated', success: true };
  }

  sendOrderToCourier(courierId: string, orderData: any) {
    this.server.to(`courier_${courierId}`).emit('newOrderAssigned', orderData);
  }
}
