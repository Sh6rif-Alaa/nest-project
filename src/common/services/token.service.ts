import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    generateToken = async ({ payload, options = {} }: { payload: Object, options?: JwtSignOptions }): Promise<string> => {
        return await this.jwtService.signAsync(payload, options)
    }

    verifyToken = async ({ token, options = {} }: { token: string, options?: JwtVerifyOptions }): Promise<JwtPayload> => {
        return await this.jwtService.verifyAsync(token, options) as JwtPayload
    }
}

export default TokenService