//#region Imports
// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Const } from './const.entity';
import { constService } from './const.service';
import { ConstController } from './const.controller';
import { usersService } from 'src/users/users.service';
import { UserModule } from 'src/users/users.module';
//#endregion

//#region Module
@Module({
  imports: [TypeOrmModule.forFeature([Const]), UserModule],
  providers: [constService],
  controllers: [ConstController],
  exports: [constService],
})
export class ConstModule {}
//#endregion
