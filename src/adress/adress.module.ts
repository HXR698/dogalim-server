//#region Imports
import { Module } from '@nestjs/common';
import { AdressService } from './adress.service';
import { AdressController } from './adress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/adress.entity';
//#endregion

//#region Module
@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  controllers: [AdressController],
  providers: [AdressService],
  exports: [AdressService],
})
export class AdressModule {}
//#endregion