import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { PComm } from '../../p-comm/entities/p-comm.entity';
import { Sellers } from '../../sellers/entities/seller.entity';
import { Prodht } from '../../prodht/entities/prodht.entity';
import { LikedProds } from '../../liked-prods/entities/liked-prod.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  price!: number;

  @Column({ default: 0 })
  ratingSum!: number;

  @Column({ default: 0 })
  ratingCount!: number;

  @Column()
  explanation!: string;
  
  @ManyToOne(() => Sellers, review => review.products)
  seller!: Sellers;

  @OneToMany(() => PComm, review => review.product)
  reviews!: PComm[];

  @ManyToMany(() => Prodht, review => review.product,  { cascade: true })
  @JoinTable()
  hashtags!: Prodht[];

  @OneToMany(() => LikedProds, (liked) => liked.product)
  likedByUsers!: LikedProds[];
}
