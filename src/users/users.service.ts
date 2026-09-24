import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import * as argon2 from '@node-rs/argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async addUser(createUserDto: CreateUserDto) {
    const { email, password, phone, username } = createUserDto;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone ? phone.trim() : null;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    if (existingUser) throw new ConflictException('Bu e posta adresi veya telefon numarasi gecersiz')

    const hashedPassword = await argon2.hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });

    try {
      const newUser = await this.prisma.user.create({
        data: {
          username: username,
          email: normalizedEmail,
          phone: normalizedPhone,
          pass_hash: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu.',
        data: newUser,
      };
    } catch (error) { throw new InternalServerErrorException('Kayıt oluşturulurken beklenmeyen bir hata oluştu.') }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { email, password, phone, username } = updateUserDto;
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('Kullanıcı bulunamadı.')
    const dataToUpdate: any = {};

    if (username) { dataToUpdate.username = username.trim() }
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== existingUser.email) {
        const emailConflict = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (emailConflict) { throw new ConflictException('Bu e-posta adresi ile zaten bir hesap mevcut.') }
        dataToUpdate.email = normalizedEmail;
      }
    }
    if (phone !== undefined) {
      const normalizedPhone = phone ? phone.trim() : null;
      if (normalizedPhone !== existingUser.phone) {
        if (normalizedPhone) {
          const phoneConflict = await this.prisma.user.findUnique({
            where: { phone: normalizedPhone },
          });
          if (phoneConflict) { throw new ConflictException('Bu telefon numarası ile zaten bir hesap mevcut.') }
        }
        dataToUpdate.phone = normalizedPhone;
      }
    }
    if (password) {
      dataToUpdate.pass_hash = await argon2.hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        message: 'Kullanıcı başarıyla güncellendi.',
        data: updatedUser,
      };
    } catch (error) { throw new InternalServerErrorException('Kullanıcı güncellenirken beklenmeyen bir hata oluştu.') }
  }

  async deleteUser(id: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) { throw new NotFoundException('Kullanıcı bulunamadı.') }

    try {
      await this.prisma.user.delete({ where: { id } });

      return {
        success: true,
        message: 'Kullanıcı başarıyla silindi.',
      };
    } catch (error) { throw new InternalServerErrorException('Kullanıcı silinirken beklenmeyen bir hata oluştu.') }
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        username: true,
        email: true,
        phone: true,
      },
    });

    if (!user) { throw new NotFoundException('Kullanıcı bulunamadı.') }

    return {
      success: true,
      data: user,
    };
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const { title, address, latitude, longitude } = dto;

    const pointWkt = `SRID=4326;POINT(${longitude} ${latitude})`;

    const newAddress = await this.prisma.$queryRaw<any[]>`
    INSERT INTO "Address" (id, userid, title, address, location)
    VALUES (gen_random_uuid(), ${userId}, ${title}, ${address}, ST_GeogFromText(${pointWkt}))
    RETURNING id, userid, title, address;
  `;

    return {
      success: true,
      message: 'Adres başarıyla kaydedildi.',
      data: newAddress[0],
    };
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userid: userId },
    });

    if (!address) { throw new NotFoundException('Güncellenecek adres bulunamadı.') }

    const { title, address: addressText, latitude, longitude } = dto;

    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...(title && { title }),
        ...(addressText && { address: addressText }),
      },
    });

    if (latitude !== undefined && longitude !== undefined) {
      const pointWkt = `SRID=4326;POINT(${longitude} ${latitude})`;
      await this.prisma.$executeRaw`
      UPDATE "Address"
      SET location = ST_GeogFromText(${pointWkt})
      WHERE id = ${addressId}
    `;
    }

    return {
      success: true,
      message: 'Adres başarıyla güncellendi.',
      data: updatedAddress,
    };
  }

  async getFavProds(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) { throw new NotFoundException('Kullanıcı bulunamadı.') }

    try {
      const favorites = await this.prisma.likedProds.findMany({
        where: { userid: userId },
        include: { product: true }
      });

      return {
        success: true,
        data: favorites,
      };
    } catch (error) { throw new InternalServerErrorException('Favori ürünler getirilirken beklenmeyen bir hata oluştu.') }
  }
}
