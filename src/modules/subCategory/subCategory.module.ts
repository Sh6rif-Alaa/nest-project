import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SubCategoryModel } from 'src/DB/models/subCategory.model';
import { CategoryModel } from 'src/DB/models/category.model';
import { UserModel } from 'src/DB/models/user.model';
import SubCategoryRepo from 'src/DB/repo/subCategory.repo';
import CategoryRepo from 'src/DB/repo/category.repo';
import UserRepo from 'src/DB/repo/user.repo';
import TokenService from 'src/common/services/token.service';
import S3Service from 'src/common/services/s3.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { SubCategoryController } from './subCategory.controller';
import { SubCategoryService } from './subCategory.service';

@Module({
    imports: [SubCategoryModel, CategoryModel, UserModel, RedisModule],
    controllers: [SubCategoryController],
    providers: [SubCategoryService, SubCategoryRepo, CategoryRepo, UserRepo, TokenService, JwtService, S3Service],
    exports: [],
})
export class SubCategoryModule { }
