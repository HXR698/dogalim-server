//#region Imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { NotFoundException } from '@nestjs/common';
//#endregion

@Injectable()
export class productService {
  //#region Constructor
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}
  //#endregion

  //#region Add Product
  async addProduct(data: { name: string; evaluation: string; price: string; explanation: string}) {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }
  //#endregion

  //#region Get Product By ID
  async getProductById(id: number): Promise<Product> {
    const product =  await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }
  //#endregion

  //#region Get Product Price By ID
  async getProductPriceById(id: number): Promise<string> {
    const product =  await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product.price;
  }
  //#endregion
}
