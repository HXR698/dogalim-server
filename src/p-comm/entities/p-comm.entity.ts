import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Users } from '../../users/entities/users.entity';

@Entity()
@Unique(['commenter', 'product'])
export class PComm {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Product, product => product.reviews, { onDelete: 'CASCADE' })
  product!: Product;

  @ManyToOne(() => Users, user => user.reviews, { onDelete: 'CASCADE' })
  commenter!: Users;

  @Column({ type: 'text' })
  comment!: string;

  @Column({ type: 'int' })
  evaluation!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
