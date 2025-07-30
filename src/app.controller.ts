//#region Imports
import {Controller, Get, Post, Body, ParseFloatPipe} from '@nestjs/common';
import { productService } from './product/product.service';
import { usersService } from './users/users.service';
import { constService } from './const/const.service';
import { parse } from 'path';
//#endregion

//#region Controller way = /command
@Controller("command")
export class AppController {
  //#region Constuctor
  constructor(private readonly productService: productService, private readonly usersService: usersService, private readonly constService: constService) {}
  //#endregion

  //#region Handle Get Command
  @Get()
  handleGetCommand() {
    console.log("Get komutu atildi.");
  }
  //#endregion

  //#region Handle Post Command
  @Post()
  async handlePostCommand(@Body() data: any): Promise<string> {
    const command = data.command;
    //#region Send Product To Home Page
    if (command === "0") { // product Informations Are Send To The Home Page
      console.log("kullanici uygulamaya girdi");
      return "1|12|8|0,1,2|Tavuk Dürüm,,★5.0,,99.99 TL***Köfte,,★4.2,,149.99 TL***Kebap,,★3.9,,127.89 TL***.,,.,,.,,***.,,.,,.,,***.,,.,,.,,***.,,.,,.,,***.,,.,,.,,";
    }
    //#endregion
    //#region Take Product Info Whose ID is given
    else if (command === "1") { // takes The Information Of The Product Whose ID Is Given
      const productID = data.product;
      console.log("kullanici " + productID + " ID li productun overviewine giris yapti")
      const product_1 = await this.productService.getProductById(parseInt(productID) + 1);
      console.log(`1|${product_1.id - 1}|${product_1.name}|${product_1.evaluation}|${product_1.price}|${product_1.explanation}`);
      return `1|${product_1.id - 1}|${product_1.name}|${product_1.evaluation}|${product_1.price}|${product_1.explanation}`;
    }
    //#endregion
    //#region Increase Amount Or Add it to the Basket
    else if (command === "2") { // increase A Products Amount Or Add It To The Basket
      const productid = data.productid;
      const userid = await this.usersService.getUserByEmail(data.email);
      var amount = await this.constService.checkIfProductAlreadyInBasket(Number(userid), Number(productid))
      if (amount !== null) {//increase Amount
        const amount0 = await this.constService.increaseAmount(Number(userid), Number(productid))
        return `${amount0}`;
      } else if (amount === null) {// Add to the Basket
        this.constService.addConst({user_id: Number(userid), product_id: Number(productid), amount: 1})
        return "1";
      }
      return "0";
    }
    //#endregion
    //#region Delete Product From Basket
    else if (command === "3") { // delete A Product From Stated Users Basket
      try {
        const productid = data.productid;
        const userid = await this.usersService.getUserByEmail(data.email);
        this.constService.deleteConst(Number(userid), Number(productid));
        return "1";
      }
      catch {
        return "0";
      }
    }
    //#endregion
    //#region Get Products From Basket
    else if (command === "4") { // get A List Of Products There Are In The Basket Of The Stated User
      const userid = await this.usersService.getUserByEmail(data.email);
      const fullList = await this.constService.getValuesByUserID(Number(userid));
      const ids = fullList[0];
      const amounts = fullList[1];
      var fullPrice = 0;
      for (let i = 0; i < ids.length; i++) {
        const price = this.productService.getProductPriceById(ids[i] + 1);
        fullPrice = fullPrice + parseFloat(await price) * amounts[i];
      }
      return `${JSON.stringify(fullList)}|${fullPrice}`;
    }
    //#endregion
    //#region Decrease Product Amount
    else if (command === "5") { // decrease Product Amount
      try {
        const productid = data.productid;
        const userid = await this.usersService.getUserByEmail(data.email);
        var amount = await this.constService.checkIfProductAlreadyInBasket(Number(userid), Number(productid))
        const amount0 = await this.constService.decreaseAmount(Number(userid), Number(productid))
        return `${amount0}`;
      } catch {
        return "";
      }
    }
    //#endregion
    else {
      return "0";
    }
  }
  //#endregion
}
//#endregion
