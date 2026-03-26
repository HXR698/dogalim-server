import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { Users } from 'src/users/entities/users.entity';
import { Sellers } from 'src/sellers/entities/seller.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Sellers)
    private readonly sellerRepo: Repository<Sellers>,
  ) {/*console.log(followRepo)*/}

  async create(userId: number, sellerId: number) {
    const exists = await this.followRepo.exist({where: { user: { id: userId }, seller: { id: sellerId } }});
    if (exists) throw new ConflictException('Already following this seller');
    const follow = this.followRepo.create({ user: { id: userId } as Users, seller: { id: sellerId } as Sellers });
    await this.followRepo.save(follow);
    return { followed: true };
  }

  async remove(userId: number, sellerId: number) {
    const follow = await this.followRepo.findOne({
      where: {
        user: { id: userId },
        seller: { id: sellerId }
      },
      relations: ['user', 'seller']
    });
    if (!follow) throw new NotFoundException('Follow relationship not found');
    await this.followRepo.remove(follow);
    return { unfollowed: true };
  }

  async findAllByUser(userId: number) {
    return await this.followRepo.find({where: { user: { id: userId } }, relations: ['seller'], order: { followedAt: 'DESC' }});
  }

  async findSomeByUser(userId: number, skp: number, tk: number) {
    return await this.followRepo.find({where: { user: { id: userId } }, relations: ['seller', 'seller.hashtags'], order: { followedAt: 'DESC' }, skip: skp, take: tk});
  }

  async findAllBySeller(sellerId: number) {
    return await this.followRepo.find({where: { seller: { id: sellerId } }, relations: ['user'], order: { followedAt: 'DESC' }});
  }

  async exists(userId: number, sellerId: number): Promise<boolean> {
    return await this.followRepo.exist({where: {user: { id: userId }, seller: { id: sellerId }}});
  }

  async countBySeller(sellerId: number): Promise<number> {
    return await this.followRepo.count({where: { seller: { id: sellerId } }});
  }
}
