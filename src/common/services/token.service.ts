import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload, JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';
import RedisService from './redis.service';
import UserRepo from 'src/DB/repo/user.repo';
import { TokenTypeEnum } from '../enum/user.enum';

@Injectable()
class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepo: UserRepo,
        private readonly redisService: RedisService
    ) { }

    generateToken = async ({ payload, options = {} }: { payload: Object, options?: JwtSignOptions }): Promise<string> => {
        return await this.jwtService.signAsync(payload, options)
    }

    verifyToken = async ({ token, options = {} }: { token: string, options?: JwtVerifyOptions }): Promise<JwtPayload> => {
        try {
            return await this.jwtService.verifyAsync(token, options) as JwtPayload
        } catch (err) {
            if (err instanceof TokenExpiredError) throw new BadRequestException('token expired')
            if (err instanceof NotBeforeError) throw new BadRequestException('token not active yet')
            if (err instanceof JsonWebTokenError) throw new BadRequestException('invalid token')
            throw err
        }
    }


    getSignature = (prefix: string) => {
        let accessSecret: string | undefined
        let refreshSecret: string | undefined

        if (prefix === process.env.PREFIX_USER) {
            accessSecret = process.env.ACCESS_USER_TOKEN_KEY
            refreshSecret = process.env.REFRESH_USER_TOKEN_KEY
        } else if (prefix === process.env.PREFIX_ADMIN) {
            accessSecret = process.env.ACCESS_ADMIN_TOKEN_KEY
            refreshSecret = process.env.REFRESH_ADMIN_TOKEN_KEY
        } else {
            throw new BadRequestException('invalid prefix')
        }

        return { accessSecret, refreshSecret }
    }

    decodeTokenAndFetchUser = async (token: string, secret: string) => {
        const decode = await this.verifyToken({ token, options: { secret } })

        if (!decode || !decode?.id) throw new BadRequestException('invalid token')

        const user = await this.userRepo.findById(decode.id)

        if (!user) throw new NotFoundException('user not exist')

        if (user.changeCredential?.getTime()! > decode.iat! * 1000) throw new BadRequestException('invalid all token')

        const revokeToken = await this.redisService.getValue(this.redisService.revokeKey({ userId: user._id, jti: decode.jti as unknown as string }))

        if (revokeToken) throw new BadRequestException('invalid token revokeToken')

        return { decode, user }
    }
}

export default TokenService