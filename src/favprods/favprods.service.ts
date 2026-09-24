import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavprodsService {
  constructor(private readonly prisma: PrismaService) { }

  async addFavProd(userId: string, prodId: string) {
    const existingProduct = await this.prisma.prod.findUnique({ where: { id: prodId } });

    if (!existingProduct) { throw new NotFoundException('Favorilere eklenmek istenen ürün bulunamadı.') }

    try {
      const likedProd = await this.prisma.likedProds.create({
        data: {
          userid: userId,
          prodid: prodId,
        },
      });

      return {
        success: true,
        message: 'Ürün başarıyla favorilere eklendi.',
        data: likedProd,
      };
    } catch (error) {
      if (error.code === 'P2002') { throw new ConflictException('Bu ürün zaten favorilerinizde ekli.') }
      throw new InternalServerErrorException('Ürün favorilere eklenirken bir hata oluştu.');
    }
  }

  async deleteFavProd(userId: string, prodId: string) {
    const existingLike = await this.prisma.likedProds.findUnique({
      where: {
        userid_prodid: {
          userid: userId,
          prodid: prodId,
        },
      },
    });
    if (!existingLike) { throw new NotFoundException('Favorilerinizde olmayan bir ürünü çıkaramazsınız.') }

    try {
      const deletedLike = await this.prisma.likedProds.delete({
        where: {
          userid_prodid: {
            userid: userId,
            prodid: prodId,
          },
        },
      });

      return {
        success: true,
        message: 'Ürün favorilerden çıkarıldı.',
        data: deletedLike,
      };
    } catch (error) { throw new InternalServerErrorException('Ürün favorilerden çıkarılırken bir hata oluştu.') }
  }

  async checkStatus(userId: string, prodId: string) {
    const like = await this.prisma.likedProds.findUnique({
      where: {
        userid_prodid: {
          userid: userId,
          prodid: prodId,
        },
      },
    });

    return {
      success: true,
      data: {
        isLiked: !!like,
      },
    };
  }
}
