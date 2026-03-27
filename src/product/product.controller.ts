import { Controller, Delete, Get, ParseIntPipe, Body, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';

//! updated for authorization attacks
//? basic algorithm is done

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@CurrentUser('id') userId: number, @Body() data: CreateProductDto) {
    return this.productService.createProd(userId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updateProd(@Param('id', ParseIntPipe) prodId: number, @Body() body: UpdateProductDto, @CurrentUser('id') sellerId: number) {
    return this.productService.update(sellerId, prodId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  removeProd(@CurrentUser('id') sellerId: number, @Param('id', ParseIntPipe) prodId: number) {
    return this.productService.remove(sellerId, prodId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('prod/:prodId')
  getProd(@Param('prodId', ParseIntPipe) sellerId: number) {
    return this.productService.getProductById(sellerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('price/:prodId')
  getProdPrice(@Param('prodId', ParseIntPipe) sellerId: number) {
    return this.productService.getProductPriceById(sellerId);
  }
}
