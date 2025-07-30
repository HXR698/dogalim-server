//#region Imports
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product/product.entity';
import { Users } from './users/users.entity'
import { Const } from './const/const.entity'
import { ProductModule } from './product/product.module';
import { productService } from './product/product.service';
import { UserModule } from './users/users.module';
import { ConstModule } from './const/const.module';
import { MailModule } from './mail/mail.module';
import { EmailController } from './email/email.controller';
import { EmailVerificationService } from './emailverification/emailverification.service';
import { EmailVerificationController } from './emailverification/emailverification.controller';
import { AdressModule } from './adress/adress.module';
import { Address } from './adress/entities/adress.entity';
//#endregion

//#region Module
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'hxr698SH455',
      database: 'productDB',
      entities: [Product, Users, Const, Address],
      synchronize: true, // geliştirme için true, prod'da false yap!
    }),
    ProductModule,
    UserModule,
    ConstModule,
    MailModule,
    AdressModule,
  ],
  controllers: [AppController, EmailController, EmailVerificationController],
  providers: [AppService, EmailVerificationService],
})
export class AppModule {}
//#endregion