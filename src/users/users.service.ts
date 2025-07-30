//#region Imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Int32, IntegerType, Repository } from 'typeorm';
import { Users } from './users.entity';
import { NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
//#endregion

//#region SHA-256 Hash
function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
//#endregion

@Injectable()
export class usersService {
    //#region Constructor
    constructor(
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,
    ) {}
    //#endregion

    //#region Add User
    async addUser(data: { user_name: string; mail_adr: string; password: string;}) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    //#endregion

    //#region Get User By ID
    async getUserById(id: number): Promise<Users> {
        const user =  await this.userRepo.findOneBy({ id });
        if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }
    //#endregion

    //#region Get User Pass
    async getUserPass(username: string): Promise<string | null> {
        const pass = await this.userRepo.findOne({where: { mail_adr: username }, select: ['password']});
        return pass ? pass.password : null;
    }
    //#endregion

    //#region Get User By Email
    async getUserByEmail(email: string): Promise<IntegerType | null> {
        const userID = await this.userRepo.findOne({where: { mail_adr: email}, select: ['id']});
        return userID ? userID.id : null;
    }
    //#endregion
}
