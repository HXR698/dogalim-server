import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSellerCommentDto } from './dto/create-seller-comment.dto';
import { UpdateSellerCommentDto } from './dto/update-seller-comment.dto';
import * as argon2 from '@node-rs/argon2';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) { }

  async addSeller(createSellerDto: CreateSellerDto) {
    const { email, password, ...rest } = createSellerDto;

    const existingSeller = await this.prisma.seller.findUnique({ where: { email } });

    if (existingSeller) { throw new ConflictException('Bu e-posta adresiyle kayıtlı bir satıcı zaten mevcut.') }

    try {
      const hashedPassword = await argon2.hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
      });

      const newSeller = await this.prisma.seller.create({
        data: {
          ...rest,
          email,
          pass_hash: hashedPassword,
        },
      });

      const { pass_hash: pass, ...sellerWithoutPassword } = newSeller;

      return {
        success: true,
        message: 'Satıcı başarıyla kaydedildi.',
        data: sellerWithoutPassword,
      };
    } catch (error) { throw new InternalServerErrorException('Satıcı kaydı oluşturulurken beklenmeyen bir hata oluştu.') }
  }

  async getSeller(sellerId: string, requester: { id: string; role: string }) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) { throw new NotFoundException('Satıcı bulunamadı.') }

    const isSelf = requester.role === 'seller' && requester.id === sellerId;
    if (requester.role === 'seller' && !isSelf) { throw new ForbiddenException('Başka bir satıcının profiline erişemezsiniz.') }

    const sellerData = isSelf
      ? {
        storename: seller.storename,
        rating: seller.rating,
        reviewcount: seller.reviewcount,
        email: seller.email,
        phone: seller.phone,
        minbasketamount: seller.minbasketamount,
        isapproved: seller.isapproved,
        isopen: seller.is_open,
        createdat: seller.created_at,
      }
      : {
        storename: seller.storename,
        rating: seller.rating,
        reviewcount: seller.reviewcount,
        minbasketamount: seller.minbasketamount,
        isapproved: seller.isapproved,
        isopen: seller.is_open,
        createdAt: seller.created_at,
      };

    return {
      success: true,
      data: sellerData,
    };
  }

  async updateSeller(sellerId: string, updateSellerDto: UpdateSellerDto) {
    const existingSeller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!existingSeller) { throw new NotFoundException('Satıcı bulunamadı.') }

    const { storename, password, email, phone } = updateSellerDto;
    const dataToUpdate: any = {};

    if (storename) { dataToUpdate.storename = storename.trim() }
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== existingSeller.email) {
        const emailConflict = await this.prisma.seller.findUnique({
          where: { email: normalizedEmail },
        });
        if (emailConflict) { throw new ConflictException('Bu e-posta adresi ile zaten bir hesap mevcut.') }
        dataToUpdate.email = normalizedEmail;
      }
    }
    if (phone !== undefined) {
      const normalizedPhone = phone ? phone.trim() : null;
      if (normalizedPhone !== existingSeller.phone) {
        if (normalizedPhone) {
          const phoneConflict = await this.prisma.seller.findUnique({
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
      const updatedSeller = await this.prisma.seller.update({
        where: { id: sellerId },
        data: dataToUpdate,
      });

      return {
        success: true,
        message: 'Satıcı profili başarıyla güncellendi.',
        data: updatedSeller,
      };
    } catch (error) { throw new InternalServerErrorException('Satıcı güncellenirken beklenmeyen bir hata oluştu.') }
  }

  async deleteSeller(sellerId: string) {
    const existingSeller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!existingSeller) { throw new NotFoundException('Satıcı bulunamadı.') }

    try {
      await this.prisma.seller.delete({
        where: { id: sellerId },
      });

      return {
        success: true,
        message: 'Satıcı hesabı başarıyla silindi.',
      };
    } catch (error) { throw new InternalServerErrorException('Satıcı silinirken beklenmeyen bir hata oluştu.') }
  }

  async addComment(userId: string, sellerId: string, createCommentDto: CreateSellerCommentDto) {
    const existingComment = await this.prisma.sellerCom.findUnique({
      where: {
        sellerid_userid: {
          sellerid: sellerId,
          userid: userId,
        },
      },
    });

    if (existingComment) { throw new ConflictException('Bu satıcıya zaten daha önce bir değerlendirme yaptınız.') }

    try {
      const [newComment] = await this.prisma.$transaction([
        this.prisma.sellerCom.create({
          data: {
            sellerid: sellerId,
            userid: userId,
            rating: createCommentDto.rating,
            comment: createCommentDto.comment,
          },
        }),
        this.prisma.seller.update({
          where: { id: sellerId },
          data: {
            rating: {
              increment: createCommentDto.rating,
            },
            reviewcount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        success: true,
        message: 'Değerlendirmeniz başarıyla eklendi.',
        data: newComment,
      };
    } catch (error) { throw new InternalServerErrorException('Yorum eklenirken beklenmeyen bir hata oluştu.') }
  }

  async updateComment(userId: string, sellerId: string, updateCommentDto: UpdateSellerCommentDto) {
    const existingComment = await this.prisma.sellerCom.findUnique({
      where: {
        sellerid_userid: {
          sellerid: sellerId,
          userid: userId,
        },
      },
    });

    if (!existingComment) { throw new NotFoundException('Güncellenecek değerlendirme bulunamadı.') }

    const oldRating = existingComment.rating;
    const newRating = updateCommentDto.rating !== undefined ? updateCommentDto.rating : oldRating;
    const ratingDifference = newRating - oldRating;

    try {
      const [updatedComment] = await this.prisma.$transaction([
        this.prisma.sellerCom.update({
          where: {
            sellerid_userid: {
              sellerid: sellerId,
              userid: userId,
            },
          },
          data: {
            ...(updateCommentDto.rating !== undefined && { rating: updateCommentDto.rating }),
            ...(updateCommentDto.comment !== undefined && { comment: updateCommentDto.comment }),
          },
        }),
        ...(ratingDifference !== 0
          ? [
            this.prisma.seller.update({
              where: { id: sellerId },
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

  async getComments(sellerId: string) {
    const existingSeller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
    if (!existingSeller) { throw new NotFoundException('Satıcı bulunamadı.') }

    const comments = await this.prisma.sellerCom.findMany({
      where: { sellerid: sellerId },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      data: { comments }
    };
  }

  async deleteComment(userId: string, sellerId: string) {
    const existingComment = await this.prisma.sellerCom.findUnique({
      where: {
        sellerid_userid: {
          sellerid: sellerId,
          userid: userId,
        },
      },
    });

    if (!existingComment) { throw new NotFoundException('Silinecek değerlendirme bulunamadı.') }

    try {
      const [deletedComment] = await this.prisma.$transaction([
        this.prisma.sellerCom.delete({
          where: {
            sellerid_userid: {
              sellerid: sellerId,
              userid: userId,
            },
          },
        }),
        this.prisma.seller.update({
          where: { id: sellerId },
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
        message: 'Değerlendirmeniz başarıyla silindi.',
        data: deletedComment,
      };
    } catch (error) { throw new InternalServerErrorException('Değerlendirme silinirken beklenmeyen bir hata oluştu.') }
  }
}
