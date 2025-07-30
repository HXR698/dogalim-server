//#region Imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/adress.entity';
//#endregion

//#region 
@Injectable()
export class AdressService {
  //#region Constructor
  constructor(@InjectRepository(Address)private adressRepo: Repository<Address>,) {}
  //#endregion

  //#region Create
  async create(body: any): Promise<string> {
    try {
      const address = this.adressRepo.create(body);
      await this.adressRepo.save(address);
      return "1";
    }
    catch (error)
    {
      console.log(error.message);
      return "0";
    }
  }
  //#endregion

  //#region Find One By Email
  async findOneByEmail(email: string): Promise<Address | null> {
    return await this.adressRepo.findOneBy({ email });
  }
  //#endregion

  //#region Update
  async update(body: any): Promise<string> {
    try {
      await this.adressRepo.update({ email: body.email }, body);
      return "1";
    }
    catch (error)
    {
      console.log(`[ERROR AT ADDRESS.SERVIFCE.TS]: ${error}`);
      return "0";
    }
  }
  //#endregion
}
//#endregion