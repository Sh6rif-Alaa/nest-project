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
import BrandRepo from "src/DB/repo/brand.repo";
import { BrandModel } from "src/DB/models/brand.model";

@Module({
    imports: [CategoryModel, UserModel, RedisModule, BrandModel],
    controllers: [CategoryController],
    providers: [CategoryService, UserRepo, CategoryRepo, TokenService, JwtService, S3Service, BrandRepo],
    exports: [],
})
export class CategoryModule { }