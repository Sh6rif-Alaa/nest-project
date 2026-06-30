import { SetMetadata, applyDecorators, UseGuards } from "@nestjs/common";
import { RoleEnum, TokenTypeEnum } from "../enum/user.enum";
import { AuthGuard } from "../guards/authentication.guard";
import { AuthorizationGuard } from "../guards/authorization.guard";

export const TOKEN_TYPE = 'tokenType'
export const ROLE_KEY = 'role'

export const TokenType = (type: TokenTypeEnum = TokenTypeEnum.accessToken) => SetMetadata(TOKEN_TYPE, type)

export const Roles = (roles: RoleEnum[] = [RoleEnum.user]) => SetMetadata(ROLE_KEY, roles)

export function Auth({
    type = TokenTypeEnum.accessToken, roles = [RoleEnum.user]
}: { type?: TokenTypeEnum, roles?: RoleEnum[] } = {}) {
    return applyDecorators(
        TokenType(type),
        Roles(roles),
        UseGuards(AuthGuard, AuthorizationGuard),
    );
}

