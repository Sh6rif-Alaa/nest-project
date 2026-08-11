import { Module } from "@nestjs/common";
import { UserModel } from "src/DB/models/user.model";
import OrderRepo from "src/DB/repo/order.repo";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";
import { OrderModel } from "src/DB/models/order.model";
import { CouponModel } from "src/DB/models/coupon.model";
import CouponRepo from "src/DB/repo/coupon.repo";
import CartRepo from "src/DB/repo/cart.repo";
import { CartModel } from "src/DB/models/cart.model";
import ProductRepo from "src/DB/repo/product.repo";
import { ProductModel } from "src/DB/models/product.model";
import { StripeService } from "src/common/services/stripe.service";

@Module({
    imports: [OrderModel, UserModel, RedisModule, CouponModel, CartModel, ProductModel],
    controllers: [OrderController],
    providers: [OrderService, UserRepo, OrderRepo, TokenService, JwtService, CouponRepo, CartRepo, ProductRepo,StripeService],
    exports: [],
})
export class OrderModule { }