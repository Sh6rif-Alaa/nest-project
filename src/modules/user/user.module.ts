import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserModel } from "src/DB/models/user.model";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import S3Service from "src/common/services/s3.service";

@Module({
    imports: [UserModel, RedisModule],
    controllers: [UserController],
    providers: [UserService, UserRepo, TokenService, JwtService, S3Service],
    exports: [],
})
export class UserModule { }