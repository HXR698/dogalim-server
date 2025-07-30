//#region Imports
// src/product/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
//#endregion

//#region Data Base
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_name: string;

  @Column({unique: true})
  mail_adr: string;

  @Column()
  password: string;
}
//#endregion