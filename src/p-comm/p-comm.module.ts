import { Module, forwardRef } from '@nestjs/common';
import { PCommService } from './p-comm.service';
import { PCommController } from './p-comm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PComm } from './entities/p-comm.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PComm]),
    forwardRef(() => ProductModule)
  ],
  controllers: [PCommController],
  providers: [PCommService],
  exports: [PCommService]
})
export class PCommModule {}
