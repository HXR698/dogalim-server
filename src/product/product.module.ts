//#region Imports
// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { productService } from './product.service';
import { ProductController } from './product.controller';
//#endregion

//#region Module
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [productService],
  controllers: [ProductController],
  exports: [productService],
})
export class ProductModule {}
//#endregion