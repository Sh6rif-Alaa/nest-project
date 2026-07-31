import { Model } from 'mongoose';
import { SubCategory } from '../models/subCategory.model';
import BaseRepo from './base.repo';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
class SubCategoryRepo extends BaseRepo<SubCategory> {
    constructor(@InjectModel(SubCategory.name) model: Model<SubCategory>) { super(model) }
}

export default SubCategoryRepo
