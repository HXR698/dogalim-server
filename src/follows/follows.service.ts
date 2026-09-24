import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) { }

  async addFollow(userId: string, sellerId: string) {
    const existingSeller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
    if (!existingSeller) { throw new NotFoundException('Takip edilmek istenen satıcı bulunamadı.') }

    try {
      const follow = await this.prisma.follows.create({
        data: {
          userid: userId,
          sellerid: sellerId,
        },
      });

      return {
        success: true,
        message: 'Satıcı başarıyla takip edildi.',
        data: follow,
      };
    } catch (error) {
      if (error.code === 'P2002') { throw new ConflictException('Bu satıcıyı zaten takip ediyorsunuz.') }
      throw new InternalServerErrorException('Satıcı takip edilirken bir hata oluştu.');
    }
  }

  async deleteFollow(userId: string, sellerId: string) {
    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        userid_sellerid: {
          userid: userId,
          sellerid: sellerId,
        },
      },
    });

    if (!existingFollow) { throw new NotFoundException('Zaten takip etmediğiniz bir satıcıyı takipten çıkamazsınız.') }

    try {
      const deletedFollow = await this.prisma.follows.delete({
        where: {
          userid_sellerid: {
            userid: userId,
            sellerid: sellerId,
          },
        },
      });

      return {
        success: true,
        message: 'Satıcı takipten çıkıldı.',
        data: deletedFollow,
      };
    } catch (error) { throw new InternalServerErrorException('Takipten çıkılırken bir hata oluştu.') }
  }

  async checkStatus(userId: string, sellerId: string) {
    const follow = await this.prisma.follows.findUnique({
      where: {
        userid_sellerid: {
          userid: userId,
          sellerid: sellerId,
        },
      },
    });

    return {
      success: true,
      data: {
        isFollowing: !!follow,
      },
    };
  }
}
