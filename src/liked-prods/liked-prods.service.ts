import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LikedProds } from './entities/liked-prod.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLikedProdsDto } from './dto/create-liked-prod.dto';

@Injectable()
export class LikedProdsService {
  constructor(
    @InjectRepository(LikedProds)
    private readonly likedProdsRepo: Repository<LikedProds>,
  ) {/*console.log(likedProdsRepo)*/}

  async create(userId: number, dto: CreateLikedProdsDto) {
    const exists = await this.likedProdsRepo.findOne({where: { user: { id: userId }, product: { id: dto.productId } }});
    if (exists) return exists;
    const liked = this.likedProdsRepo.create({user: { id: userId }, product: { id: dto.productId }});
    return await this.likedProdsRepo.save(liked);
  }

  async remove(userId: number, prodId: number) {
    const result = await this.likedProdsRepo.delete({user: { id: userId }, product: { id: prodId }});
    if (result.affected === 0) throw new NotFoundException('Like not found');
    return { deleted: true };
  }

  async findAllByUser(userId: number) {
    return await this.likedProdsRepo.find({where: { user: { id: userId } }, relations: ['product'], order: { likedAt: 'DESC' }});
  }

  async exists(userId: number, productId: number): Promise<boolean> {
      return await this.likedProdsRepo.exist({where: { user: { id: userId }, product: { id: productId } }});
  }
}