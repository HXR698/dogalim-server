import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AdressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Users } from '../users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Users])],
  controllers: [AdressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}