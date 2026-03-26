import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Sellers } from '../../sellers/entities/seller.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 64 })
  refreshToken!: string;

  @ManyToOne(() => Users, user => user.refreshTokens, { onDelete: 'CASCADE' })
  user!: Users;

  @Column({ length: 128 })
  deviceid!: string;

  @Column({ nullable: true })
  ipadress!: string;
  
  @Column({ nullable: true, type: 'text' })
  useragent!: string;

  @Column({ type: 'timestamp' })
  expiresat!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedat!: Date;
}

@Entity('seller_refresh_tokens')
export class SellerRefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 64 })
  refreshToken!: string;

  @ManyToOne(() => Sellers, seller => seller.refreshTokens, { onDelete: 'CASCADE' })
  seller!: Sellers;

  @Column({ length: 128 })
  deviceid!: string;

  @Column({ nullable: true })
  ipadress!: string;
  
  @Column({ nullable: true, type: 'text' })
  selleragent!: string;

  @Column({ type: 'timestamp' })
  expiresat!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedat!: Date;
}