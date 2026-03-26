// seller.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sellers } from './entities/seller.entity';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { Hashtags } from 'src/hashtags/entities/hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sellers, Hashtags])],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService]
})
export class SellerModule {}
