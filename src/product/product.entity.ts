//#region Imports
// src/product/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
//#endregion

//#region Data Base
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  evaluation: string;

  @Column()
  explanation: string;
}
//#endregion