import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToOne, CreateDateColumn } from 'typeorm';
import { Sellers } from '../../sellers/entities/seller.entity';
import { Users } from '../../users/entities/users.entity';

@Entity()
@Unique(['commenter', 'seller'])
export class SComm {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Sellers, seller => seller.reviews, { onDelete: 'CASCADE' })
  seller!: Sellers;

  @ManyToOne(() => Users, user => user.reviews, { onDelete: 'CASCADE' })
  commenter!: Users;

  @Column({ type: 'text' })
  comment!: string;

  @Column({ type: 'int' })
  evaluation!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
