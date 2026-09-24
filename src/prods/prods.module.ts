import { Module } from '@nestjs/common';
import { ProdsService } from './prods.service';
import { ProdsController } from './prods.controller';

@Module({
  controllers: [ProdsController],
  providers: [ProdsService],
})
export class ProdsModule {}
