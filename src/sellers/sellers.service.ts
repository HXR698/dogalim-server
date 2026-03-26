import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sellers } from './entities/seller.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Hashtags } from 'src/hashtags/entities/hashtag.entity';
import * as argon2 from 'argon2';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Sellers)
    private readonly sellerRepo: Repository<Sellers>,
    @InjectRepository(Hashtags)
    private readonly hashtagRepo: Repository<Hashtags>
  ) {/*console.log(sellerRepo, hashtagRepo)*/}
  
  async create(dto: CreateSellerDto) {
    const hashedPassword = await argon2.hash(dto.password);
    let hashtags: Hashtags[] = [];

    if (dto.hashtags && dto.hashtags.length > 0) {
      hashtags = await Promise.all(
        dto.hashtags.map(async (tag) => {
          let existing = await this.hashtagRepo.findOne({where: { hashtag: tag }});

          if (!existing) {
            existing = this.hashtagRepo.create({ hashtag: tag });
            await this.hashtagRepo.save(existing);
          }
          return existing;
        }),
      );
    }

    const seller = this.sellerRepo.create({
      user_name: dto.user_name,
      mail_adr: dto.mail_adr,
      password: hashedPassword,
      hashtags: hashtags,
      explanation: dto.explanation
    });
    
    try {
      return await this.sellerRepo.save(seller);
    } catch (err: any) {
      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  async verifyPass(id: number, gPass: string) {
    const seller = await this.sellerRepo.findOne({where: { id }, select: ['password']});
    if (!seller) throw new UnauthorizedException('Invalid credentials');
    return await argon2.verify(seller.password, gPass);
  }

  async findOne(id: number) {
    const seller = await this.sellerRepo.findOne({where: { id }});
    if (!seller) throw new NotFoundException(`Seller with id ${id} not found`);
    return seller;
  }

  async findTrends() {
    return this.sellerRepo
    .createQueryBuilder("seller")
    .leftJoinAndSelect("seller.hashtags", "hashtag")
    .orderBy("seller.ratingSum / NULLIF(seller.ratingCount,0)", "DESC")
    .limit(8)
    .getMany();
  }

  async update(id: number, updateSellerDto: UpdateSellerDto) {
    const seller = await this.sellerRepo.findOne({where: { id }});

    if (!seller) {
      throw new NotFoundException(`Seller with id ${id} not found`);
    }

    if (updateSellerDto.password)
    {
      updateSellerDto.password = await argon2.hash(updateSellerDto.password);
    }
    Object.assign(seller, updateSellerDto);
    return await this.sellerRepo.save(seller);
  }

  async remove(id: number) {
    const seller = await this.sellerRepo.findOne({where: { id }});

    if (!seller) throw new NotFoundException(`Seller with id ${id} not found`);
    return await this.sellerRepo.remove(seller);
  }

  async updateRating(sellerId: number, Rating: number, increase: boolean) {
    let result;
    if (increase) {
      result = await this.sellerRepo
        .createQueryBuilder()
        .update()
        .set({
          ratingCount: () => `"ratingCount" + 1`,
          ratingSum: () => `ratingSum + Rating`
        })
        .where("id = :id", { id: sellerId })
        .setParameter("newRating", Rating)
        .execute();
    } else {
      result = await this.sellerRepo
        .createQueryBuilder()
        .update()
        .set({
          ratingCount: () => `"ratingCount" - 1`,
          ratingSum: () => `ratingSum - Rating`
        })
        .where("id = :id", { id: sellerId })
        .setParameter("newRating", Rating)
        .execute();
    }

    if (result.affected === 0) throw new NotFoundException();
    return { updated: true };
  }
}
