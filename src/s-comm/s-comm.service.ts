import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { SComm } from './entities/s-comm.entity';
import { CreateSCommDto } from './dto/create-s-comm.dto';
import { UpdateSCommDto } from './dto/update-s-comm.dto';
import { SellersService } from '../sellers/sellers.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SCommService {
  constructor(
    @InjectRepository(SComm)
    private readonly scommRepo: Repository<SComm>,

    private readonly sellerService: SellersService
  ) {/*console.log(scommRepo, sellerService)*/}

  async create(userId: number, data: CreateSCommDto) {
    try {
      const sc = await this.scommRepo.save({comment: data.comment, evaluation: data.evaluation, seller: {id: data.sellerId}, commenter: {id: userId}});
      await this.sellerService.updateRating(data.sellerId, data.evaluation, true);
      return sc;
    } catch (err: any) {
      if (err instanceof QueryFailedError && ((err as any).code === 'ER_DUP_ENTRY' || (err as any).code === 1062)) {
        throw new ConflictException('You already reviewed this seller');
      }
      throw err;
    }
  }

  async findOne(id: number) {
    const scomm = await this.scommRepo.findOne({where: { id }});
    if (!scomm) throw new NotFoundException();
    return scomm;
  }

  async update(reviewId: number, userId: number, data: UpdateSCommDto) {
    const scomm = await this.scommRepo.findOne({where: { commenter: {id: userId}, seller: {id: reviewId} }});
    if (!scomm) throw new NotFoundException();
    Object.assign(scomm, data);
    return await this.scommRepo.save(scomm);
  }

  async remove(userId: number, sellerId: number) {
    const sc = await this.scommRepo.findOne({where: { commenter: {id: userId}, seller: {id: sellerId} }});
    if (!sc) throw new NotFoundException();
    await this.sellerService.updateRating(sc.seller.id, sc.evaluation, false);
    return await this.scommRepo.remove(sc);
  }

  async findAllBySellerId(sellerId: number) {
    return await this.scommRepo.find({
      where: { seller: { id: sellerId } },
      relations: ['commenter'],
      select: {id: true, comment: true, evaluation: true, createdAt: true, commenter: {id: true, user_name: true}},
      order: { createdAt: 'DESC' }});
  }
}
