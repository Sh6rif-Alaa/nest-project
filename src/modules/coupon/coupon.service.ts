import { CreateCouponDto, UpdateCouponDto } from "./coupon.dto";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import successResponse from "src/common/utils/response.success";
import CouponRepo from "src/DB/repo/coupon.repo";
import UserRepo from "src/DB/repo/user.repo";
import { Types } from "mongoose";

@Injectable()
export class CouponService {
    constructor(
        private readonly couponRepo: CouponRepo,
        private readonly userRepo: UserRepo,
    ) { }

    async createCoupon({ amount, code, fromDate, toDate }: CreateCouponDto, userId: Types.ObjectId): Promise<any> {
        if (await this.couponRepo.findOne({ filter: { code: code.trim().toLowerCase() } }))
            throw new ConflictException("coupon already exists")

        const coupon = await this.couponRepo.create({
            amount,
            code,
            fromDate,
            toDate,
            createdBy: userId
        })

        return successResponse({ data: coupon })
    }

    async updateCoupon({ amount, code, fromDate, toDate }: UpdateCouponDto, couponId: Types.ObjectId, userId: Types.ObjectId): Promise<any> {
        if (!await this.couponRepo.findOne({ filter: { _id: couponId, createdBy: userId } }))
            throw new NotFoundException("coupon not found")

        if (code && await this.couponRepo.findOne({ filter: { code: code.trim().toLowerCase() } }))
            throw new ConflictException("coupon already exists")

        const coupon = await this.couponRepo.findOneAndUpdate({
            filter: { _id: couponId },
            update: {
                $set: {
                    amount,
                    code,
                    fromDate,
                    toDate,
                }
            }
        })

        return successResponse({ data: coupon })
    }

    async deleteCoupon(couponId: Types.ObjectId): Promise<any> {
        const coupon = await this.couponRepo.findByIdAndDelete(couponId)
        if (!coupon) throw new NotFoundException("coupon not found")
        
        return successResponse({ data: "coupon deleted successfully" })
    }
}