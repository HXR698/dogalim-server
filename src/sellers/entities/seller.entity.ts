import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { SComm } from '../../s-comm/entities/s-comm.entity';
import { Product } from '../../product/entities/product.entity';
import { Hashtags } from '../../hashtags/entities/hashtag.entity';
import { SellerRefreshToken } from '../../refresh-token/entities/refresh-token.entity';
import { Follow } from '../../follows/entities/follow.entity';

@Entity()
export class Sellers {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_name!: string;

  @Column({ unique: true })
  mail_adr!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  explanation!: string;

  @Column({ default: 0 })
  ratingSum!: number;

  @Column({ default: 0 })
  ratingCount!: number;

  @OneToMany(() => SComm, review => review.seller)
  reviews!: SComm[];

  @OneToMany(() => Product, review => review.seller)
  products!: Product[];

  @ManyToMany(() => Hashtags, hashtag => hashtag.seller,  { cascade: true })
  @JoinTable()
  hashtags!: Hashtags[];

  @OneToMany(() => SellerRefreshToken, sellerrefreshtoken => sellerrefreshtoken.seller)
  refreshTokens!: SellerRefreshToken[];

  @OneToMany(() => Follow, (follow) => follow.seller)
  followers!: Follow[];
}
