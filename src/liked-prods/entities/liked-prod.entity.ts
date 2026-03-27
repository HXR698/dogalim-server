import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, CreateDateColumn } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('liked_products')
@Unique(['user', 'product']) // aynı ürünü 2 kez like edemez
export class LikedProds {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Users, (user) => user.likedProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @ManyToOne(() => Product, (product) => product.likedByUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @CreateDateColumn()
  likedAt!: Date;
}