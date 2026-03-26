import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LikedProdsService } from './liked-prods.service';
import { LikedProdsController } from './liked-prods.controller';
import { LikedProds } from './entities/liked-prod.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([LikedProds])],
  controllers: [LikedProdsController],
  providers: [LikedProdsService],
  exports: [LikedProdsService]
})
export class LikedProdsModule {}
