import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Users } from './entities/users.entity';
import * as argon2 from 'argon2';

/*const hashedPassword = await argon2.hash(data.password, {
  type: argon2.argon2id,
  memoryCost: Number(process.env.ARGON_MEMORY) || 65536,
  timeCost: Number(process.env.ARGON_TIME) || 3,
  parallelism: 1,
});*/

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,
    ) {/*console.log(userRepo)*/}

    async addUser(data: { user_name: string; mail_adr: string; password: string;}) {
        const hashedPass = await argon2.hash(data.password, {type: argon2.argon2id, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1});
        const user = this.userRepo.create({user_name: data.user_name, mail_adr: data.mail_adr, password: hashedPass});
        try {
            await this.userRepo.save(user);
            return {success: true};
        } catch (err) {
            if (err instanceof QueryFailedError) {
                const driverError = (err as any).driverError;
                if (driverError?.code === '23505') throw new ConflictException('Email already exists');
            }
            throw err;
            // return {success: false};
        }
    }

    async findUserById(id: number): Promise<Users> {
        const user =  await this.userRepo.findOneBy({ id });
        if (!user) {throw new NotFoundException(`User with id ${id} not found`);}
        return user;
    }

    async findByEmail(email: string): Promise<Users | null> {
        return this.userRepo.findOne({where: { mail_adr: email }});
    }
}
