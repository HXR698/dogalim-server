import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Users, user => user.cartItems)
  user!: Users;

  @OneToMany(() => CartItem, item => item.cart, { cascade: true })
  items!: CartItem[];
}

@Unique(['cart', 'product'])
@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cart, cart => cart.items)
  cart!: Cart;

  @ManyToOne(() => Product)
  product!: Product;

  @Column({ default: 1 })
  quantity!: number;
}
