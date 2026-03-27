import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { Users } from '../users/entities/users.entity';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>
  ) {/*console.log(addressRepo, userRepo)*/}

  async create(userId: number, data: CreateAddressDto) {
    const address = this.addressRepo.create({user: {id: userId}, ...data});
    return await this.addressRepo.save(address);
  }

  async getUsersAddresses(userId: number) {
    return await this.addressRepo.find({where: { user: { id: userId } }});
  }

  async getDefaultAddress(userId: number) {
    return await this.userRepo.findOne({where: { id: userId }, relations: ['defaultAddress'], select: {id: true, defaultAddress: true}});
  }

  async updateAddress(userId: number, addressId: number, data: UpdateAddressDto) {
    const result = await this.addressRepo.update({id: addressId, user: { id: userId }}, data);
    if (result.affected === 0) throw new NotFoundException('Address not found');
    return { updated: true };
  }

  async deleteAddress(userId: number, addressId: number) {
    const result = await this.addressRepo.delete({id: addressId, user: { id: userId }});
    if (result.affected === 0) throw new NotFoundException('Address not found');
    return { deleted: true };
  }

  async setDefaultAddress(userId: number, addressId: number) {
    const address = await this.addressRepo.findOne({where: { id: addressId, user: { id: userId } }});
    if (!address) throw new NotFoundException('Address not found');
    await this.userRepo.update(userId, {defaultAddress: address});
    return { updated: true };
  }

  async getOne(userId: number, addressId: number) {
    const address = await this.addressRepo.findOne({where: { id: addressId, user: { id: userId } }});
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async validateOwnership(userId: number, addressId: number) {
    const exists = await this.addressRepo.exist({where: { id: addressId, user: { id: userId } }});
    if (!exists) throw new NotFoundException('Invalid address');
    return {exists: true};
  }

  async getAddressSnapshot(userId: number, addressId: number) {
    const address = await this.getOne(userId, addressId);
    return {phone: address.phone, city: address.city, district: address.district, postalCode: address.postalCode, addressLine: address.addressLine};
  }
}
