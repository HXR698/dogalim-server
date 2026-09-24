import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateProdDto } from './dto/create-prod.dto';
import { UpdateProdDto } from './dto/update-prod.dto';
import { CreateProdCommDto } from './dto/create-prod-comment.dto';
import { UpdateProdCommDto } from './dto/update-prod-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProdsService {
  constructor(private readonly prisma: PrismaService) { }

  async addProd(sellerId: string, createProdDto: CreateProdDto) {
    const existingSeller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!existingSeller) { throw new NotFoundException('Satıcı bulunamadı.') }

    try {
      const newProduct = await this.prisma.prod.create({
        data: {
          sellerid: sellerId,
          name: createProdDto.name,
          price: createProdDto.price,
          stock: createProdDto.stock ?? 0,
          description: createProdDto.description,
          imageUrl: createProdDto.imageUrl,
          isAvailable: createProdDto.isAvailable ?? true,
          prepare_time: createProdDto.prepare_time,
        },
      });

      return {
        success: true,
        message: 'Ürün başarıyla eklendi.',
        data: newProduct,
      };
    } catch (error) { throw new InternalServerErrorException('Ürün eklenirken beklenmeyen bir hata oluştu.') }
  }

  async updateProd(sellerId: string, productId: string, updateProdDto: UpdateProdDto) {
    const existingProduct = await this.prisma.prod.findFirst({
      where: {
        id: productId,
        sellerid: sellerId,
      },
    });

    if (!existingProduct) { throw new NotFoundException('Güncellenecek ürün bulunamadı.') }

    try {
      const updatedProduct = await this.prisma.prod.update({
        where: { id: productId },
        data: {
          ...(updateProdDto.name !== undefined && { name: updateProdDto.name }),
          ...(updateProdDto.price !== undefined && { price: updateProdDto.price }),
          ...(updateProdDto.stock !== undefined && { stock: updateProdDto.stock }),
          ...(updateProdDto.description !== undefined && { description: updateProdDto.description }),
          ...(updateProdDto.imageUrl !== undefined && { imageUrl: updateProdDto.imageUrl }),
          ...(updateProdDto.isAvailable !== undefined && { isAvailable: updateProdDto.isAvailable }),
          ...(updateProdDto.prepare_time !== undefined && { prepare_time: updateProdDto.prepare_time }),
        },
      });

      return {
        success: true,
        message: 'Ürün başarıyla güncellendi.',
        data: updatedProduct,
      };
    } catch (error) { throw new InternalServerErrorException('Ürün güncellenirken beklenmeyen bir hata oluştu.') }
  }

  async getProd(productId: string) {
    const product = await this.prisma.prod.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            storename: true,
            isapproved: true,
            is_open: true,
          },
        },
      },
    });

    if (!product) { throw new NotFoundException('Ürün bulunamadı.') }

    return {
      success: true,
      data: product,
    };
  }

  async deleteProd(sellerId: string, productId: string) {
    const existingProduct = await this.prisma.prod.findFirst({
      where: {
        id: productId,
        sellerid: sellerId,
      },
    });

    if (!existingProduct) { throw new NotFoundException('Silinecek ürün bulunamadı veya bu ürünü silme yetkiniz yok.') }

    try {
      const deletedProduct = await this.prisma.prod.delete({
        where: { id: productId },
      });

      return {
        success: true,
        message: 'Ürün başarıyla silindi.',
        data: deletedProduct,
      };
    } catch (error) { throw new InternalServerErrorException('Ürün silinirken beklenmeyen bir hata oluştu.') }
  }

  async addProdComm(userId: string, productId: string, createProdComDto: CreateProdCommDto) {
    const existingProduct = await this.prisma.prod.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) { throw new NotFoundException('Ürün bulunamadı.') }

    try {
      const [newComment] = await this.prisma.$transaction([
        this.prisma.prodCom.create({
          data: {
            prodid: productId,
            userid: userId,
            rating: createProdComDto.rating,
            comment: createProdComDto.comment,
          },
        }),
        this.prisma.prod.update({
          where: { id: productId },
          data: {
            rating: {
              increment: createProdComDto.rating,
            },
            reviewcount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        success: true,
        message: 'Ürün değerlendirmeniz başarıyla eklendi.',
        data: newComment,
      };
    } catch (error) {
      if (error.code === 'P2002') { throw new InternalServerErrorException('Bu ürüne zaten daha önce bir değerlendirme yapmışsınız.') }
      throw new InternalServerErrorException('Değerlendirme eklenirken beklenmeyen bir hata oluştu.');
    }
  }

  async updateProdComm(userId: string, productId: string, updateProdComDto: UpdateProdCommDto) {
    const existingComment = await this.prisma.prodCom.findUnique({
      where: {
        prodid_userid: {
          prodid: productId,
          userid: userId,
        },
      },
    });
    if (!existingComment) { throw new NotFoundException('Güncellenecek değerlendirme bulunamadı.') }

    const newRating = updateProdComDto.rating ?? existingComment.rating;
    const ratingDifference = newRating - existingComment.rating;

    try {
      const [updatedComment] = await this.prisma.$transaction([
        this.prisma.prodCom.update({
          where: {
            prodid_userid: {
              prodid: productId,
              userid: userId,
            },
          },
          data: {
            ...(updateProdComDto.rating !== undefined && { rating: updateProdComDto.rating }),
            ...(updateProdComDto.comment !== undefined && { comment: updateProdComDto.comment }),
          },
        }),
        ...(ratingDifference !== 0
          ? [
            this.prisma.prod.update({
              where: { id: productId },
              data: {
                rating: {
                  increment: ratingDifference,
                },
              },
            }),
          ]
          : []),
      ]);

      return {
        success: true,
        message: 'Değerlendirmeniz başarıyla güncellendi.',
        data: updatedComment,
      };
    } catch (error) { throw new InternalServerErrorException('Değerlendirme güncellenirken beklenmeyen bir hata oluştu.') }
  }

  async getProdComments(productId: string) {
    const existingProduct = await this.prisma.prod.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) { throw new NotFoundException('Ürün bulunamadı.') }

    const comments = await this.prisma.prodCom.findMany({
      where: { prodid: productId },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      data: { comments },
    };
  }

  async deleteProdComm(userId: string, productId: string) {
    const existingComment = await this.prisma.prodCom.findUnique({
      where: {
        prodid_userid: {
          prodid: productId,
          userid: userId,
        },
      },
    });
    if (!existingComment) { throw new NotFoundException('Silinecek ürün değerlendirmesi bulunamadı.') }

    try {
      const [deletedComment] = await this.prisma.$transaction([
        this.prisma.prodCom.delete({
          where: {
            prodid_userid: {
              prodid: productId,
              userid: userId,
            },
          },
        }),
        this.prisma.prod.update({
          where: { id: productId },
          data: {
            rating: {
              decrement: existingComment.rating,
            },
            reviewcount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return {
        success: true,
        message: 'Ürün değerlendirmeniz başarıyla silindi.',
        data: deletedComment,
      };
    } catch (error) { throw new InternalServerErrorException('Ürün değerlendirmesi silinirken beklenmeyen bir hata oluştu.') }
  }
}
