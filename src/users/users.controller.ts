import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async addUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.addUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.sub;
    return await this.usersService.getUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateUser(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return await this.usersService.updateUser(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteUser(@Req() req: any) {
    const userId = req.user.sub;
    return await this.usersService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('address')
  async addAddress(@Req() req: any, @Body() createAddressDto: CreateAddressDto) {
    const userId = req.user.sub;
    return await this.usersService.addAddress(userId, createAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('address/:id')
  async updateAddress(
    @Req() req: any,
    @Param('id') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = req.user.sub;
    return await this.usersService.updateAddress(userId, addressId, updateAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavProds(@Req() req: any) {
    const userId = req.user.sub;
    return await this.usersService.getFavProds(userId);
  }
}
