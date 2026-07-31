import { Module } from "@nestjs/common";
import { UserModel } from "src/DB/models/user.model";
import CouponRepo from "src/DB/repo/coupon.repo";
import { CouponController } from "./coupon.controller";
import { CouponService } from "./coupon.service";
import TokenService from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import UserRepo from "src/DB/repo/user.repo";
import { RedisModule } from "src/common/redis/redis.module";
import { CouponModel } from "src/DB/models/coupon.model";

@Module({
    imports: [CouponModel, UserModel, RedisModule],
    controllers: [CouponController],
    providers: [CouponService, UserRepo, CouponRepo, TokenService, JwtService],
    exports: [],
})
export class CouponModule { }