import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ParseIntPipe} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('addresses')
export class AdressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@CurrentUser() userId: number, @Body() dto: CreateAddressDto) {
    return this.addressService.create(userId, dto);
  }

  @Get()
  getAll(@CurrentUser() userId: number) {
    return this.addressService.getUsersAddresses(userId);
  }

  @Get(':id')
  getOne(@CurrentUser() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.getOne(userId, id);
  }

  @Patch(':id')
  update(@CurrentUser() userId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto) {
    return this.addressService.updateAddress(userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.deleteAddress(userId, id);
  }

  @Patch(':id/set-default')
  setDefault(@CurrentUser() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.setDefaultAddress(userId, id);
  }

  @Get('default/me')
  getDefault(@CurrentUser() userId: number) {
    return this.addressService.getDefaultAddress(userId);
  }
}