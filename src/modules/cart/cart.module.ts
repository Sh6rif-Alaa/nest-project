import { Module } from "@nestjs/common";
import { UserModel } from "src/DB/models/user.model";
import CartRepo from "src/DB/repo/cart.repo";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";
import { CartModel } from "src/DB/models/cart.model";
import ProductRepo from "src/DB/repo/product.repo";
import { ProductModel } from "src/DB/models/product.model";

@Module({
    imports: [CartModel, UserModel, RedisModule, ProductModel],
    controllers: [CartController],
    providers: [CartService, UserRepo, CartRepo, TokenService, JwtService, ProductRepo],
    exports: [],
})
export class CartModule { }