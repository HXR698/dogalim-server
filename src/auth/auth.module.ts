import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { UserModule } from '../users/users.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import * as fs from 'fs';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: fs.readFileSync('keys/private.key'),
      publicKey: fs.readFileSync('keys/public.key'),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '15m',
      },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => RefreshTokenModule)],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
