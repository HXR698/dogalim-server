import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtags } from './entities/hashtag.entity';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtags)
    private readonly hashtagsRepo: Repository<Hashtags>
  ) {/*console.log(hashtagsRepo)*/}

  async create(createPCommDto: CreateHashtagDto) {
    return await this.hashtagsRepo.save(createPCommDto);
  }

  async findOne(hashtagId: number) {
    const hashtag = await this.hashtagsRepo.findOne({where: { id: hashtagId }, relations: ['seller']});
    if (!hashtag) throw new NotFoundException();
    return hashtag;
  }

  async update(tagId: number, updateHashtagDto: UpdateHashtagDto) {
    const hashtag = await this.hashtagsRepo.findOne({where: { id: tagId }});
    if (!hashtag) throw new NotFoundException();
    Object.assign(hashtag, updateHashtagDto);
    return await this.hashtagsRepo.save(hashtag);
  }

  async remove(id: number) {
    const result = await this.hashtagsRepo.delete({id});
    if (result.affected === 0) throw new NotFoundException();
    return {removed: true};
  }
}
