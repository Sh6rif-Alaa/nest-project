import CategoryRepo from "src/DB/repo/category.repo";
import { CreateCategoryDto } from "./category.dto";
import S3Service from "src/common/services/s3.service";
import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { type UserDocument } from "src/DB/models/user.model";
import { BadGatewayException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import successResponse from "src/common/utils/response.success";
import { Types } from "mongoose";
import BrandRepo from "src/DB/repo/brand.repo";


@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepo: CategoryRepo,
        private readonly brandRepo: BrandRepo,
        private readonly s3Service: S3Service,
    ) { }

    async createCategory(file: Express.Multer.File, { title, brands }: CreateCategoryDto, user: UserDocument): Promise<any> {
        if (await this.categoryRepo.findOne({ filter: { title } })) throw new ConflictException("Category already exists")

        const stringBrandIds = ([... new Set(brands || [])] as any).map(id => Types.ObjectId.createFromHexString(id));

        if (brands?.length && (await this.brandRepo.findByIds(stringBrandIds)).length !== stringBrandIds.length)
            throw new NotFoundException("some of id not found")

        const { secure_url, public_id } = await this.s3Service.uploadFile({
            file,
            path: `categories/${title}/category_image`,
            ACL: ObjectCannedACL.public_read
        })

        const category = await this.categoryRepo.create({
            title,
            image: { secure_url, public_id },
            brands,
            createdBy: user._id
        });

        if (!category) {
            await this.s3Service.deleteFile(public_id);
            throw new BadGatewayException("faild to create category")
        }

        return successResponse({ data: category })
    }

    async getAllCategories(): Promise<any> {
        const categories = await this.categoryRepo.find()
        return successResponse({ data: categories })
    }

    async getCategoryById(id: Types.ObjectId): Promise<any> {
        const category = await this.categoryRepo.findById(id)
        return successResponse({ data: category })
    }

    async updateCategory(file: Express.Multer.File, id: Types.ObjectId, { title }: CreateCategoryDto): Promise<any> {
        if (await this.categoryRepo.findOne({ filter: { title } })) throw new ConflictException("Category already exists")
        const categoryBefore = await this.categoryRepo.findById(id)
        if (!categoryBefore) throw new NotFoundException("Category not found")

        let secure_url: string | undefined
        let public_id: string | undefined
        if (file) {
            const { secure_url: data1, public_id: data2 } = await this.s3Service.uploadFile({
                file,
                path: `categories/${title}/category_image`,
                ACL: ObjectCannedACL.public_read

            })
            secure_url = data1
            public_id = data2
        }
        const category = await this.categoryRepo.findByIdAndUpdate({
            id,
            update: { $set: { title, image: { secure_url, public_id } } },
        })
        if (!category) throw new NotFoundException("Category not found")
        file && categoryBefore?.image?.public_id && await this.s3Service.deleteFile(categoryBefore.image.public_id!)
        return successResponse({ data: category })
    }

    async deleteCategory(id: Types.ObjectId): Promise<any> {
        const category = await this.categoryRepo.findByIdAndDelete(id)
        if (!category) throw new NotFoundException("Category not found")
        await this.s3Service.deleteFile(category?.image?.public_id!)
        return successResponse({ data: category })
    }
}