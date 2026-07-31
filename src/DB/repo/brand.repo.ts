import { Model, Types } from "mongoose";
import { Brand } from "../models/brand.model";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
class BrandRepo extends BaseRepo<Brand> {
    constructor(@InjectModel(Brand.name) model: Model<Brand>) { super(model) }

    async findByIds(ids: Types.ObjectId[]): Promise<Brand[]> {
        return this.model.find({ _id: { $in: ids } })
    }
}

export default BrandRepo