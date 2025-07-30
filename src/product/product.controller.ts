//#region Imports
// src/product/product.controller.ts
import { Controller, Get, Body, Post } from '@nestjs/common';
import { Product } from './product.entity';
import { constants } from 'buffer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { productService } from './product.service';
//#endregion

//#region Controller way = /add/product (Add Product)
@Controller('add/product')
export class ProductController {
  //#region Constructor
  constructor(private readonly productService: productService) {}
  //#endregion

  //#region Handle Post Command
  @Post()
  async handlePostCommand(@Body() data: any): Promise<String> {
    // command info(name price evaluation explanation)
    const command = data.command;
    //#region Save Product
    if (command === "0") {
      var productInfo = data.info;
      productInfo = productInfo.split("|");
      const savedProduct = await this.productService.addProduct({name: productInfo[0], price: productInfo[1], evaluation: productInfo[2], explanation: productInfo[3]});
      return `ürün ${savedProduct.id} numarali id ile kaydedildi.`;
    }
    //#endregion
    //#region Get Product By ID
    else if (command === "1") {
      const product_0 = await this.productService.getProductById(data.id);
      return `1|${product_0.id}|${product_0.name}|${product_0.evaluation}|${product_0.price}|${product_0.explanation}`;
    }
    //#endregion
    return "0";
  }
  //#endregion
}
//#endregion
