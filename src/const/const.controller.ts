//#region Imports
// src/product/product.controller.ts
import { Controller, Get, Body, Post } from '@nestjs/common';
import { Const } from './const.entity';
import { constants } from 'buffer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegerType, Repository } from 'typeorm';
import { constService } from './const.service';
import { usersService } from 'src/users/users.service';
//#endregion

//#region Controller way = /add/const (Add Const)
@Controller('add/const')
export class ConstController {
  //#region Constructor
  constructor(private readonly constService: constService, private readonly usersService: usersService) {}
  //#endregion

  //#region Handle Post Command
  @Post()
  async handlePostCommand(@Body() data: any): Promise<String> {
    // command info(user_id product_id amount)
    const command = data.command;
    //#region Sepete Ürün Ekle
    if (command === "0") {
      var constInfo = data.info;
      constInfo = constInfo.split("|");
      const x: IntegerType | null = await this.usersService.getUserByEmail(constInfo[0]);
      if (x === null) {
        throw new Error("Kullanici Bulunamadi.");
      }
      const userID: number = x as number;
      const savedConst = await this.constService.addConst({user_id: userID, product_id: constInfo[1], amount: 1});
      return `1`;
    }
    //#endregion
    //#region ID ye göre Const Alma
    else if (command === "1") {
      const const0 = await this.constService.getConstById(data.id);
      return `1|${const0.id}|${const0.user_id}|${const0.product_id}|${const0.amount}`;
    }
    //#endregion
    return "0";
  }
  //#endregion
}
//#endregion
