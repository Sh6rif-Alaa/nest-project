import { Model } from "mongoose";
import { Coupon } from "../models/coupon.model";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
class CouponRepo extends BaseRepo<Coupon> {
    constructor(@InjectModel(Coupon.name) model: Model<Coupon>) { super(model) }
}

export default CouponRepo