import { Model } from "mongoose";
import { Cart } from "../models/cart.model";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
class CartRepo extends BaseRepo<Cart> {
    constructor(@InjectModel(Cart.name) model: Model<Cart>) { super(model) }
}

export default CartRepo