//#region Imports
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdressService } from './adress.service';
//#endregion

//#region Controller way = /address
@Controller('address')
export class AdressController {
  //#region Constructor
  constructor(private readonly adressService: AdressService) {}
  //#endregion

  //#region Handle Post Command
  @Post()
  async handlePostCommand(@Body() data: any) {
    const command = data.command;
    //#region Find One By Email
    if (command === "0")
    {
      const address = await this.adressService.findOneByEmail(data.email);
      return `${address?.email},,,${address?.name},,,${address?.address}`;
    }
    //#endregion

    //#region Update
    else if (command === "1")
    {
      return this.adressService.update(data.info);
    }
    //#endregion

    //#region Create
    else if (command === "2")
    {
      return this.adressService.create(data.adress);
    }
    //#endregion

    //#region Else
    else
    {
      return "0";
    }
    //#endregion
  }
  //#endregion
}
//#endregion
