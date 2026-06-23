import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserModel } from "src/DB/models/user.model";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [UserModel, RedisModule],
    controllers: [UserController],
    providers: [UserService, UserRepo, TokenService, JwtService],
    exports: [],
})
export class UserModule { }