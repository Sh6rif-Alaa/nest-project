import { BadGatewayException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { Types } from 'mongoose';
import SubCategoryRepo from 'src/DB/repo/subCategory.repo';
import CategoryRepo from 'src/DB/repo/category.repo';
import S3Service from 'src/common/services/s3.service';
import { type UserDocument } from 'src/DB/models/user.model';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './subCategory.dto';
import successResponse from 'src/common/utils/response.success';

@Injectable()
export class SubCategoryService {
    constructor(
        private readonly subCategoryRepo: SubCategoryRepo,
        private readonly categoryRepo: CategoryRepo,
        private readonly s3Service: S3Service,
    ) { }

    async createSubCategory(file: Express.Multer.File, { title, category }: CreateSubCategoryDto, user: UserDocument): Promise<any> {
        if (await this.subCategoryRepo.findOne({ filter: { title } }))
            throw new ConflictException('SubCategory already exists')

        if (!await this.categoryRepo.findById(category))
            throw new NotFoundException('Parent category not found')

        const { secure_url, public_id } = await this.s3Service.uploadFile({
            file,
            path: `subCategories/${title}/subCategory_image`,
            ACL: ObjectCannedACL.public_read
        })

        const subCategory = await this.subCategoryRepo.create({
            title,
            category,
            image: { secure_url, public_id },
            createdBy: user._id
        })

        if (!subCategory) {
            await this.s3Service.deleteFile(public_id)
            throw new BadGatewayException('Failed to create subCategory')
        }

        return successResponse({ data: subCategory })
    }

    async getAllSubCategories(categoryId?: Types.ObjectId): Promise<any> {
        const filter = categoryId ? { category: categoryId } : {}
        const subCategories = await this.subCategoryRepo.find(filter)
        return successResponse({ data: subCategories })
    }

    async getSubCategoryById(id: Types.ObjectId): Promise<any> {
        const subCategory = await this.subCategoryRepo.findById(id)
        if (!subCategory) throw new NotFoundException('SubCategory not found')
        return successResponse({ data: subCategory })
    }

    async updateSubCategory(file: Express.Multer.File, id: Types.ObjectId, { title, category }: UpdateSubCategoryDto, user: UserDocument): Promise<any> {
        const subCategoryBefore = await this.subCategoryRepo.findById(id)
        if (!subCategoryBefore) throw new NotFoundException('SubCategory not found')

        if (title && title !== subCategoryBefore.title && await this.subCategoryRepo.findOne({ filter: { title } }))
            throw new ConflictException('SubCategory title already exists')

        if (category && !await this.categoryRepo.findById(category))
            throw new NotFoundException('Parent category not found')

        let secure_url: string | undefined
        let public_id: string | undefined

        if (file) {
            const uploaded = await this.s3Service.uploadFile({
                file,
                path: `subCategories/${title ?? subCategoryBefore.title}/subCategory_image`,
                ACL: ObjectCannedACL.public_read
            })
            secure_url = uploaded.secure_url
            public_id = uploaded.public_id
        }

        const subCategory = await this.subCategoryRepo.findByIdAndUpdate({
            id,
            update: { title, category, image: { secure_url, public_id } }
        })

        if (!subCategory) throw new NotFoundException('SubCategory not found')

        if (file && subCategoryBefore.image?.public_id)
            await this.s3Service.deleteFile(subCategoryBefore.image.public_id)

        return successResponse({ data: subCategory })
    }

    async deleteSubCategory(id: Types.ObjectId): Promise<any> {
        const subCategory = await this.subCategoryRepo.findByIdAndDelete(id)
        if (!subCategory) throw new NotFoundException('SubCategory not found')
        await this.s3Service.deleteFile(subCategory.image?.public_id!)
        return successResponse({ data: subCategory })
    }
}
