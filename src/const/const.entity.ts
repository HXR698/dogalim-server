//#region Imports
// src/product/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
//#endregion

//#region DataBase
@Entity()
export class Const {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  product_id: number;

  @Column()
  amount: number;
}
//#endregion
