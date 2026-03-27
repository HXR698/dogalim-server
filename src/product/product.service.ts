import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prodht } from '../prodht/entities/prodht.entity';
import { In } from 'typeorm';

//? basic algorithm done

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Prodht)
    private readonly hashtagRepo: Repository<Prodht>,
  ) {/*console.log(productRepo, hashtagRepo)*/}

  async createProd(seller_id: number, data: CreateProductDto) {
    const { name, price, explanation, hashtags } = data;
    const product = await this.productRepo.create({name: name, price: price, explanation: explanation, seller: {id: seller_id}});

    if (hashtags && hashtags.length > 0) {
      await this.hashtagRepo
        .createQueryBuilder()
        .insert()
        .into(Prodht)
        .values(hashtags.map(tag => ({ hashtag: tag })))
        .orIgnore()
        .execute();

      const allTags = await this.hashtagRepo.find({ where: { hashtag: In(hashtags) } });
      product.hashtags = allTags;
    }

    return this.productRepo.save(product);
  }

  async getProductById(prodId: number): Promise<Product> {
    const product =  await this.productRepo.findOne({ where: {id: prodId} });
    if (!product) {
      throw new NotFoundException(`Product with id ${prodId} not found`);
    }
    return product;
  }

  async getProductPriceById(prodId: number): Promise<number> {
    const prod = await this.productRepo.findOne({where: {id: prodId}, select: ['price']});
    if (!prod) {
      throw new NotFoundException(`Product with id ${prodId} not found`);
    }
    return prod.price;
  }

  async getTheAmountOfAllTheProducts(): Promise<number> {
    return await this.productRepo.count();
  }

  async remove(prodId: number, sellerId: number) {
    const prod = await this.productRepo.findOne({where: {id: prodId, seller: {id: sellerId}}});
    if (!prod) throw new NotFoundException();
    return await this.productRepo.remove(prod);
  }

  async update(sellerId: number, prodId: number, data: UpdateProductDto) {
    const product = await this.productRepo.findOne({where: { id: prodId, seller: {id: sellerId} }, relations: ['hashtags']});
    if (!product) throw new NotFoundException();
    const { hashtags, ...rest } = data;
    if (Object.keys(rest).length > 0) Object.assign(product, rest);

    if (hashtags) {
      await this.hashtagRepo
      .createQueryBuilder()
      .insert()
      .into(Prodht)
      .values(hashtags.map(tag => ({ hashtag: tag })))
      .orIgnore()
      .execute();

      const allTags = await this.hashtagRepo.find({where: { hashtag: In(hashtags) }});
      
      product.hashtags = allTags;
    }
    return await this.productRepo.save(product);
  }

  async updateRating(productId: number, Rating: number, increase: boolean) {
    let result;
    if (increase) {
      result = await this.productRepo
        .createQueryBuilder()
        .update()
        .set({
          ratingCount: () => `"ratingCount" + 1`,
          ratingSum: () => `ratingSum + :rating`
        })
        .where("id = :id", { id: productId })
        .setParameter("rating", Rating)
        .execute();
    } else {
      result = await this.productRepo
        .createQueryBuilder()
        .update()
        .set({
          ratingCount: () => `"ratingCount" - 1`,
          ratingSum: () => `ratingSum - :rating`
        })
        .where("id = :id", { id: productId })
        .setParameter("rating", Rating)
        .execute();
    }

    if (result.affected === 0) throw new NotFoundException();
    return { updated: true };
  }
}
