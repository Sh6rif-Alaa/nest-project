import { Body, Controller, Delete, Param, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto, UpdateCouponDto } from "./coupon.dto";
import { Auth } from "src/common/decorator/auth.decorator";
import { User } from "src/common/decorator/user.decorator";
import { type UserDocument } from "src/DB/models/user.model";
import { RoleEnum } from "src/common/enum/user.enum";
import { idDto } from "../brand/brand.dto";

@Controller("coupon")
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    @Post()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    createCoupon(@Body() body: CreateCouponDto, @User() user: UserDocument): Promise<any> {
        return this.couponService.createCoupon(body, user._id);
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    updateCoupon(@Body() body: UpdateCouponDto, @Param() params: idDto, @User() user: UserDocument): Promise<any> {
        return this.couponService.updateCoupon(body, params.id, user._id);
    }

    @Delete(":id")
    @Auth({ roles: [RoleEnum.admin] })
    deleteCoupon(@Param() params: idDto): Promise<any> {
        return this.couponService.deleteCoupon(params.id);
    }
}