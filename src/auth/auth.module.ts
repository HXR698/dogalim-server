import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService, CouriersAuthService, SellerAuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { CouriersModule } from 'src/couriers/couriers.module';
import { SellersModule } from 'src/sellers/sellers.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    SellersModule,
    CouriersModule,
    RedisModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        signOptions: { algorithm: 'RS256', expiresIn: '15m' },
        privateKey: configService.get<string>('JWT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        publicKey: configService.get<string>('JWT_PUBLIC_KEY')?.replace(/\\n/g, '\n'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SellerAuthService, CouriersAuthService],
  exports: [JwtModule, AuthService, SellerAuthService, CouriersAuthService],
})
export class AuthModule { }
