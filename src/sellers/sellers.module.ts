import { forwardRef, Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService]
})
export class SellersModule { }
