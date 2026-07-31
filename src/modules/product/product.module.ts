import { Module } from "@nestjs/common";
import { CategoryModel } from "src/DB/models/category.model";
import { UserModel } from "src/DB/models/user.model";
import CategoryRepo from "src/DB/repo/category.repo";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import S3Service from "src/common/services/s3.service";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";
import BrandRepo from "src/DB/repo/brand.repo";
import { BrandModel } from "src/DB/models/brand.model";
import { ProductModel } from "src/DB/models/product.model";
import SubCategoryRepo from "src/DB/repo/subCategory.repo";
import ProductRepo from "src/DB/repo/product.repo";
import { SubCategoryModel } from "src/DB/models/subCategory.model";

@Module({
    imports: [CategoryModel, UserModel, RedisModule, BrandModel, ProductModel, SubCategoryModel],
    controllers: [ProductController],
    providers: [ProductService, UserRepo, CategoryRepo, TokenService, JwtService, S3Service, BrandRepo, SubCategoryRepo, ProductRepo],
    exports: [],
})
export class ProductModule { }