import { Injectable, CanActivate, ExecutionContext, BadRequestException, NotFoundException } from '@nestjs/common';
import TokenService from '../services/token.service';
import { Reflector } from '@nestjs/core';
import { TokenTypeEnum } from '../enum/user.enum';
import { TOKEN_TYPE } from '../decorator/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly tokenService: TokenService,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let req: any
        let authorization: string
        const tokenType = this.reflector.get<TokenTypeEnum>(TOKEN_TYPE, context.getHandler())

        if (context.getType() === 'http') {
            req = context.switchToHttp().getRequest()
            authorization = req.headers.authorization
        } else if (context.getType() === 'ws') {
            req = context.switchToWs().getClient()
            authorization = req.handshake.auth.Authorization
        } else if (context.getType() === 'rpc') {
            req = context.switchToRpc().getContext()
            authorization = req.headers.authorization
        } else {
            throw new BadRequestException('invalid context')
        }

        if (!authorization) throw new NotFoundException('no authentication')

        const [prefix, token] = authorization.split(' ')

        if (!prefix || !token) throw new BadRequestException('invalid authentication')

        const { accessSecret, refreshSecret } = this.tokenService.getSignature(prefix)

        const secret = tokenType === TokenTypeEnum.accessToken ? accessSecret : refreshSecret

        const { decode, user } = await this.tokenService.decodeTokenAndFetchUser(token, secret as string)

        req.user = user
        req.decode = decode

        return true
    }
}
