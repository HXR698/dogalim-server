import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Prodht {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({unique: true})
  hashtag!: string;

  @ManyToMany(() => Product, prod => prod.hashtags)
  product!: Product[];
}
