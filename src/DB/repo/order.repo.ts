import { Model } from "mongoose";
import { Order } from "../models/order.model";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
class OrderRepo extends BaseRepo<Order> {
    constructor(@InjectModel(Order.name) model: Model<Order>) { super(model) }
}

export default OrderRepo