import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SellersModule } from './sellers/sellers.module';
import { ProdsModule } from './prods/prods.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { OtpModule } from './otp/otp.module';
import { FollowsModule } from './follows/follows.module';
import { FavprodsModule } from './favprods/favprods.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { CouriersModule } from './couriers/couriers.module';
import { BffModule } from './bff/bff.module';

@Module({
  imports: [AuthModule, UsersModule, SellersModule, ProdsModule, CartModule, OrdersModule, CouriersModule, OtpModule, FollowsModule, FavprodsModule, HashtagsModule, BffModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
