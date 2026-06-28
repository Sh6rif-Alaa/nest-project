import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enum/user.enum';
import { ROLE_KEY } from '../decorator/auth.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let req: any
        const roles: string[] = this.reflector.get<RoleEnum[]>(ROLE_KEY, context.getHandler())

        if (context.getType() === 'http') {
            req = context.switchToHttp().getRequest()
        } else if (context.getType() === 'ws') {
            req = context.switchToWs().getClient()
        } else if (context.getType() === 'rpc') {
            req = context.switchToRpc().getContext()
        } else {
            throw new BadRequestException('invalid context')
        }

        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedException('invalid roles')
        }

        return true
    }
}
