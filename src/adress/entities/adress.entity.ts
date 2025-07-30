//#region Imports
// src/adress/adress.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
//#endregion

//#region Data Base
@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;

  @Column()
  name: string;

  @Column()
  address: string;
}
//#endregion