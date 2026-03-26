import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { SComm } from '../../s-comm/entities/s-comm.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Address } from '../../address/entities/address.entity';
import { RefreshToken } from '../../refresh-token/entities/refresh-token.entity';
import { LikedProds } from '../../liked-prods/entities/liked-prod.entity';
import { Follow } from '../../follows/entities/follow.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_name!: string;

  @Column({unique: true})
  mail_adr!: string;

  @Column()
  password!: string;

  @OneToMany(() => SComm, review => review.commenter)
  reviews!: SComm[];

  @OneToMany(() => Cart, cart => cart.items)
  cartItems!: Cart[];

  @OneToMany(() => Address, address => address.user)
  addresses!: Address[];

  @ManyToOne(() => Address, { nullable: true })
  defaultAddress!: Address;

  @OneToMany(() => RefreshToken, refreshtoken => refreshtoken.user)
  refreshTokens!: RefreshToken;

  @OneToMany(() => LikedProds, (liked) => liked.user)
  likedProducts!: LikedProds[];

  @OneToMany(() => Follow, (follow) => follow.user)
  following!: Follow[];
}
