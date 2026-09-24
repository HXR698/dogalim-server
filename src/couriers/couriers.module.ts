import { forwardRef, Module } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { CourierGateway } from './couriers.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  providers: [CourierGateway, CouriersService],
  exports: [CouriersService]
})
export class CouriersModule { }
