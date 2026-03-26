import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as fs from 'fs'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: fs.readFileSync('keys/public.key'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: any) {
    return {
      userid: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}