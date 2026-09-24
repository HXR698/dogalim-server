import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HashtagsService {
  constructor(private readonly prisma: PrismaService) { }

  async addHashtag(type: 'seller' | 'prod', targetId: string, hashtagName: string) {
    const normalizedHashtag = hashtagName.trim().toLowerCase();

    if (type === 'seller') {
      const seller = await this.prisma.seller.findUnique({ where: { id: targetId } });
      if (!seller) throw new NotFoundException('Satıcı bulunamadı.');

      const hashtag = await this.prisma.sellerHt.upsert({
        where: { name: normalizedHashtag },
        update: {},
        create: { name: normalizedHashtag },
      });

      try {
        const relation = await this.prisma.sellerHtIt.create({
          data: {
            sellerid: targetId,
            hashtagid: hashtag.id,
          },
        });
        return { success: true, message: 'Satıcıya hashtag başarıyla eklendi.', data: relation };
      } catch (error) {
        if (error.code === 'P2002') { throw new ConflictException('Bu satıcı zaten bu hashtagi içeriyor.') }
        throw new InternalServerErrorException('Hashtag eklenirken bir hata oluştu.');
      }
    } else if (type === 'prod') {
      const product = await this.prisma.prod.findUnique({ where: { id: targetId } });
      if (!product) throw new NotFoundException('Ürün bulunamadı.');

      const hashtag = await this.prisma.prodHt.upsert({
        where: { name: normalizedHashtag },
        update: {},
        create: { name: normalizedHashtag },
      });

      try {
        const relation = await this.prisma.prodHtIt.create({
          data: {
            prodid: targetId,
            hashtagid: hashtag.id,
          },
        });
        return { success: true, message: 'Ürüne hashtag başarıyla eklendi.', data: relation };
      } catch (error) {
        if (error.code === 'P2002') { throw new ConflictException('Bu ürün zaten bu hashtagi içeriyor.') }
        throw new InternalServerErrorException('Hashtag eklenirken bir hata oluştu.');
      }
    } else { throw new BadRequestException("Geçersiz tip. 'seller' veya 'prod' olmalıdır.") }
  }

  async deleteHashtag(type: 'seller' | 'prod', targetId: string, hashtagName: string) {
    const normalizedHashtag = hashtagName.trim().toLowerCase();

    if (type === 'seller') {
      const hashtag = await this.prisma.sellerHt.findUnique({ where: { name: normalizedHashtag } });
      if (!hashtag) throw new NotFoundException('Böyle bir hashtag bulunamadı.');

      const relation = await this.prisma.sellerHtIt.findUnique({
        where: {
          sellerid_hashtagid: {
            sellerid: targetId,
            hashtagid: hashtag.id,
          },
        },
      });

      if (!relation) throw new NotFoundException('Bu satıcıda böyle bir hashtag bulunmuyor.');

      const deleted = await this.prisma.sellerHtIt.delete({
        where: {
          sellerid_hashtagid: {
            sellerid: targetId,
            hashtagid: hashtag.id,
          },
        },
      });

      return { success: true, message: 'Hashtag başarıyla kaldırıldı.', data: deleted };
    } else if (type === 'prod') {
      const hashtag = await this.prisma.prodHt.findUnique({ where: { name: normalizedHashtag } });
      if (!hashtag) throw new NotFoundException('Böyle bir hashtag bulunamadı.');

      const relation = await this.prisma.prodHtIt.findUnique({
        where: {
          prodid_hashtagid: {
            prodid: targetId,
            hashtagid: hashtag.id,
          },
        },
      });

      if (!relation) throw new NotFoundException('Bu üründe böyle bir hashtag bulunmuyor.');

      const deleted = await this.prisma.prodHtIt.delete({
        where: {
          prodid_hashtagid: {
            prodid: targetId,
            hashtagid: hashtag.id,
          },
        },
      });

      return { success: true, message: 'Hashtag başarıyla kaldırıldı.', data: deleted };
    } else { throw new BadRequestException("Geçersiz tip. 'seller' veya 'prod' olmalıdır.") }
  }

  async getByHashtag(type: 'seller' | 'prod', hashtagName: string) {
    const normalizedHashtag = hashtagName.trim().toLowerCase();

    if (type === 'seller') {
      const hashtag = await this.prisma.sellerHt.findUnique({
        where: { name: normalizedHashtag },
        include: {
          sellers: {
            include: {
              seller: true,
            },
          },
        },
      });

      if (!hashtag) { return { success: true, data: [] } }

      const sellers = hashtag.sellers.map(item => item.seller);
      return { success: true, data: sellers };
    } else if (type === 'prod') {
      const hashtag = await this.prisma.prodHt.findUnique({
        where: { name: normalizedHashtag },
        include: {
          products: {
            include: {
              prod: true,
            },
          },
        },
      });

      if (!hashtag) { return { success: true, data: [] } }

      const products = hashtag.products.map(item => item.prod);
      return { success: true, data: products };
    } else { throw new BadRequestException("Geçersiz tip. 'seller' veya 'prod' olmalıdır.") }
  }
}
