import { Module, forwardRef } from '@nestjs/common';
import { SCommService } from './s-comm.service';
import { SCommController } from './s-comm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SComm } from './entities/s-comm.entity';
import { SellerModule } from '../sellers/sellers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SComm]),
    forwardRef(() => SellerModule)
  ],
  controllers: [SCommController],
  providers: [SCommService],
  exports: [SCommService]
})
export class SCommModule {}
