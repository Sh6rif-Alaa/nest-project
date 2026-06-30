import { Model } from "mongoose";
import { Category } from "../models/category.model";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";

class CategoryRepo extends BaseRepo<Category> {
    constructor(@InjectModel(Category.name) model: Model<Category>) { super(model) }
}

export default CategoryRepo