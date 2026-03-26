import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { PComm } from './entities/p-comm.entity';
import { CreatePCommDto } from './dto/create-p-comm.dto';
import { UpdatePCommDto } from './dto/update-p-comm.dto';
import { ProductService } from '../product/product.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PCommService {
  constructor(
    @InjectRepository(PComm)
    private readonly pcommRepo: Repository<PComm>,
    private readonly productService: ProductService
  ) {/*console.log(pcommRepo, productService)*/}

  async create(commenterId: number, createPCommDto: CreatePCommDto) {
    try {
      const pc = await this.pcommRepo.save({product: {id: createPCommDto.productId}, commenter: {id: commenterId}, comment: createPCommDto.comment, evaluation: createPCommDto.evaluation});
      await this.productService.updateRating(createPCommDto.productId, createPCommDto.evaluation, true);
      return pc;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        console.error('DB hatasi: ', err.message);
      } else {
        throw err;
      }
    }
  }

  async findOne(userId: number, prodId: number) {
    const pcomm = await this.pcommRepo.findOne({where: { commenter: {id: userId}, product: {id: prodId} }});
    if (!pcomm) throw new NotFoundException();
    return pcomm;
  }

  async update(userId: number, prodId: number, data: UpdatePCommDto) {
    const pcomm = await this.pcommRepo.findOne({where: { commenter: {id: userId}, product: {id: prodId} }});
    if (!pcomm) throw new NotFoundException();
    Object.assign(pcomm, data);
    return await this.pcommRepo.save(pcomm);
  }

  async remove(userId: number, prodId: number) {
    const pcomm = await this.pcommRepo.findOne({where: { commenter: {id: userId}, product: {id: prodId} }});
    if (!pcomm) throw new NotFoundException();
    await this.productService.updateRating(prodId, pcomm.evaluation, false);
    return await this.pcommRepo.remove(pcomm);
  }

  async findAllByProdId(prodId: number) {
    return await this.pcommRepo.find({
      where: { product: { id: prodId } },
      relations: ['commenter'],
      select: {id: true, comment: true, evaluation: true, createdAt: true, commenter: {id: true, user_name: true}},
      order: { createdAt: 'DESC' }});
  }
}
