import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Prodht } from './entities/prodht.entity';
import { CreateProdhtDto } from './dto/create-prodht.dto';
import { UpdateProdhtDto } from './dto/update-prodht.dto';

@Injectable()
export class ProdhtService {
  constructor(
    @InjectRepository(Prodht)
    private readonly prodhtRepo: Repository<Prodht>,
  ) {/*console.log(prodhtRepo)*/}

  async create(createProdhtDto: CreateProdhtDto) {
    return await this.prodhtRepo.save(createProdhtDto);
  }

  async findOne(hashtagId: number) {
    const prodht = await this.prodhtRepo.findOne({where: { id: hashtagId }, relations: ['product']});
    if (!prodht) throw new NotFoundException();
    return prodht;
  }

  async update(tagId: number, updateProdhtDto: UpdateProdhtDto) {
    const prodht = await this.prodhtRepo.findOne({where: { id: tagId }});
    if (!prodht) throw new NotFoundException();
    Object.assign(prodht, updateProdhtDto);
    return await this.prodhtRepo.save(prodht);
  }

  async remove(id: number) {
    const result = await this.prodhtRepo.delete({id});
    if (result.affected === 0) throw new NotFoundException();
    return {removed: true};
  }
}
