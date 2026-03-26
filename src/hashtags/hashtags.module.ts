import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtags } from './entities/hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtags])],
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService]
})
export class HashtagsModule {}
