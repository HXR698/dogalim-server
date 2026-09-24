import { Module } from '@nestjs/common';
import { FavprodsService } from './favprods.service';
import { FavprodsController } from './favprods.controller';

@Module({
  controllers: [FavprodsController],
  providers: [FavprodsService],
})
export class FavprodsModule {}
