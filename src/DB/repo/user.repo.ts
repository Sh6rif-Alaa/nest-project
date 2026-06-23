import { Model } from "mongoose";
import { User } from "../models/user.model";
import BaseRepo from "./base.repo";
import { InjectModel } from "@nestjs/mongoose";

class UserRepo extends BaseRepo<User> {
    constructor(@InjectModel(User.name) model: Model<User>) { super(model) }
}

export default UserRepo