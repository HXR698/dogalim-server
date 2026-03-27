import { Module } from '@nestjs/common';
import { ProdhtService } from './prodht.service';
import { ProdhtController } from './prodht.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prodht } from './entities/prodht.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prodht])],
  controllers: [ProdhtController],
  providers: [ProdhtService],
  exports: [ProdhtService]
})
export class ProdhtModule {}
