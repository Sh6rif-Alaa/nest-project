import { Module } from "@nestjs/common";
import { CategoryModel } from "src/DB/models/category.model";
import { UserModel } from "src/DB/models/user.model";
import CategoryRepo from "src/DB/repo/category.repo";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import S3Service from "src/common/services/s3.service";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";

@Module({
    imports: [CategoryModel, UserModel, RedisModule],
    controllers: [CategoryController],
    providers: [CategoryService, UserRepo, CategoryRepo, TokenService, JwtService, S3Service],
    exports: [],
})
export class CategoryModule { }