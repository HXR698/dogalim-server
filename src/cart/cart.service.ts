import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './entities/cart.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-dto.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemRepo: Repository<CartItem>
    ) {/*console.log(cartRepo, cartItemRepo)*/}

    async addCartItem(userId: number, data: CreateCartItemDto) {
        let cart = await this.cartRepo.findOne({where: { user: { id: userId } }, relations: ['items']});
        if (!cart) {
            cart = this.cartRepo.create({user: { id: userId }});
            await this.cartRepo.save(cart);
        }

        const cartItem = this.cartItemRepo.create({cart: {id: cart.id}, product: {id: data.productId}, quantity: data.quantity});
        return await this.cartItemRepo.save(cartItem);
    }

    async getUsersCartItems(userId: number) {
        return await this.cartItemRepo.find({where: {cart: {user: {id: userId}}}, relations: ['product']});
    }

    async updateQuantity(userId: number, productId: number, increase: boolean) {
        if (increase) {
            await this.cartItemRepo.increment({ product: { id: productId }, cart: { user: { id: userId } } }, 'quantity', 1);
        } else {
            await this.cartItemRepo.decrement({ product: { id: productId }, cart: { user: { id: userId } } }, 'quantity', 1);
        }

        if (!increase) {
            await this.cartItemRepo
            .createQueryBuilder()
            .delete()
            .where("quantity <= 0")
            .andWhere("productId = :productId", { productId })
            .execute();
        }
        return { updated: true };
    }

    async deleteCartItem(userId: number, productId: number) {
        const result = await this.cartItemRepo.delete({product: { id: productId }, cart: { user: { id: userId } }});
        if (result.affected === 0) throw new NotFoundException();
        return { deleted: true };
    }
}
