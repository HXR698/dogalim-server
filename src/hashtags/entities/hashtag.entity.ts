import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Sellers } from '../../sellers/entities/seller.entity';

@Entity()
export class Hashtags {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({unique: true})
  hashtag!: string;

  @ManyToMany(() => Sellers, seller => seller.hashtags)
  seller!: Sellers[];
}
