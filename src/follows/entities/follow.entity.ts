import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, CreateDateColumn, Index } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Sellers } from '../../sellers/entities/seller.entity';

@Entity('follows')
@Unique(['user', 'seller'])
@Index(['user'])
@Index(['seller'])
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Users, (user) => user.following, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @ManyToOne(() => Sellers, (seller) => seller.followers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seller_id' })
  seller!: Sellers;

  @CreateDateColumn()
  followedAt!: Date;
}