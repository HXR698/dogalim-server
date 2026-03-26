import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product/entities/product.entity';
import { Users } from './users/entities/users.entity'
import { Cart, CartItem } from './cart/entities/cart.entity';
import { Sellers } from './sellers/entities/seller.entity';
import { ProductModule } from './product/product.module';
import { UserModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { MailModule } from './mail/mail.module';
import { EmailVerificationService } from './emailverification/emailverification.service';
import { EmailVerificationController } from './emailverification/emailverification.controller';
import { AddressModule } from './address/address.module';
import { Address } from './address/entities/address.entity';
import { UploadimgController } from './uploadimg/uploadimg.controller';
import { SellersController } from './sellers/sellers.controller';
import { SellerModule } from './sellers/sellers.module';
import { SCommModule } from './s-comm/s-comm.module';
import { PCommModule } from './p-comm/p-comm.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { ProdhtModule } from './prodht/prodht.module';
import { Hashtags } from './hashtags/entities/hashtag.entity';
import { Prodht } from './prodht/entities/prodht.entity';
import { SComm } from './s-comm/entities/s-comm.entity';
import { PComm } from './p-comm/entities/p-comm.entity';
import { HashtagsController } from './hashtags/hashtags.controller';
import { SCommController } from './s-comm/s-comm.controller';
import { PCommController } from './p-comm/p-comm.controller';
import { ProdhtController } from './prodht/prodht.controller';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { AuthModule } from './auth/auth.module';
import { LikedProdsModule } from './liked-prods/liked-prods.module';
import { FollowsModule } from './follows/follows.module';
import { RefreshToken, SellerRefreshToken } from './refresh-token/entities/refresh-token.entity';
import { Follow } from './follows/entities/follow.entity';
import { LikedProds } from './liked-prods/entities/liked-prod.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      //password: 'EFY0410hxr957',
      password: 'GZM962hxr957./',
      database: 'dogalimDB',
      entities: [Product, Users, Cart, Address, Sellers, Hashtags, SComm, PComm, Prodht, SellerRefreshToken, RefreshToken, Follow, CartItem, LikedProds],
      synchronize: true, // geliştirme için true, prod'da false yap!
    }),
    ProductModule,
    UserModule,
    CartModule,
    MailModule,
    AddressModule,
    SellerModule,
    SCommModule,
    PCommModule,
    HashtagsModule,
    ProdhtModule,
    RefreshTokenModule,
    AuthModule,
    LikedProdsModule,
    FollowsModule
  ],
  controllers: [EmailVerificationController, UploadimgController, SellersController, HashtagsController, ProdhtController, SCommController, PCommController],
  providers: [AppService, EmailVerificationService],
})
export class AppModule {}