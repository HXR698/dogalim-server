import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Follow } from './entities/follow.entity';
import { Users } from 'src/users/entities/users.entity';
import { Sellers } from 'src/sellers/entities/seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, Users, Sellers])],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService]
})
export class FollowsModule {}
