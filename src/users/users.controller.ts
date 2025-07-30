//#region Imports
// src/product/product.controller.ts
import { Controller, Get, Body, Post } from '@nestjs/common';
import { Users } from './users.entity';
import { constants } from 'buffer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { usersService } from './users.service';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
//#endregion

//#region SHA-256 Hash
function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
//#endregion

//#region Normalize Input
function normalizeInput(str: string): string {
  return str.normalize().replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
}
//#endregion

//#region Controller way = /add/user (Add User)
@Controller('add/user')
export class UsersController {
  //#region Constructor
  constructor(private readonly userService: usersService) {}
  //#endregion

  //#region Handle Post Command
  @Post()
  async handlePostCommand(@Body() data: any): Promise<String> {
    try {
      // command info(user_name mail_adr password)
      const command = data.command;
      //#region Save User
      if (command === "0") {
        var userInfo = data.info;
        userInfo = userInfo.split("|");
        userInfo[2] = userInfo[2].trim();
        userInfo[2] = normalizeInput(userInfo[2])
        userInfo[2] = sha256Hash(userInfo[2]);
        const savedUser = await this.userService.addUser({user_name: userInfo[0], mail_adr: userInfo[1], password: userInfo[2]});
        return "1";
      }
      //#endregion

      //#region Get User By ID
      else if (command === "1") {
        const user_0 = await this.userService.getUserById(data.id);
        return `1|${user_0.id}|${user_0.user_name}|${user_0.mail_adr}|${user_0.password}`;
      }
      //#endregion
      return "0";
    }
    catch (error)
    {
      console.log(error.message);
      return "0";
    }
  }
  //#endregion
}
//#endregion

//#region Controller way = /signin (Sign In)
@Controller('signin')
export class SignIn {
  //#region Constructor
  constructor(private readonly userService: usersService) {}
  //#endregion

  //#region Handle Post Command
  @Post()
  async handleSignIn(@Body() data: any): Promise<String> {
    const command = data.command;
    //#region Sign In
    if (command === "0") {
      var userInfo = data.info;
      userInfo = userInfo.split("|");
      userInfo[1] = userInfo[1].trim();
      userInfo[1] = normalizeInput(userInfo[1])
      userInfo[1] = sha256Hash(userInfo[1]);
      if (userInfo[1] === await this.userService.getUserPass(`${userInfo[0]}`)) {
        return "1";
      }
    }
    //#endregion
    return "0";
  }
  //#endregion
}
//#endregion
