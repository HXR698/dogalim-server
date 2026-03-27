import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RefreshTokenService, SellerRefreshTokenService } from './refresh-token.service';
import { AuthController, SellerAuthController } from './refresh-token.controller';
import { RefreshToken, SellerRefreshToken } from './entities/refresh-token.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken, SellerRefreshToken])],
  controllers: [AuthController, SellerAuthController],
  providers: [RefreshTokenService, SellerRefreshTokenService],
  exports: [RefreshTokenService, SellerRefreshTokenService]
})
export class RefreshTokenModule {}
