//#region Imports
// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { usersService } from './users.service';
import { SignIn, UsersController } from './users.controller';
//#endregion

//#region Module
@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [usersService],
  controllers: [UsersController, SignIn],
  exports: [usersService],
})
export class UserModule {}
//#endregion