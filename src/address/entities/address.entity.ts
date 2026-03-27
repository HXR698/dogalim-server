import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { Users } from '../../users/entities/users.entity';

@Entity()
@Index(['user'])
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Users, user => user.addresses, { onDelete: 'CASCADE' })
  user!: Users;

  @Column()
  phone!: string;

  @Column()
  city!: string;

  @Column()
  district!: string;

  @Column({ nullable: true })
  postalCode!: string;

  @Column({ type: 'text' })
  addressLine!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}