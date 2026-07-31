import { Model } from "mongoose";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Product } from "../models/product.model";

@Injectable()
class ProductRepo extends BaseRepo<Product> {
    constructor(@InjectModel(Product.name) model: Model<Product>) { super(model) }
}

export default ProductRepo