import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import S3Service from 'src/common/services/s3.service';
import BrandRepo from 'src/DB/repo/brand.repo';
import { CreateBrandDto, QueryDto, UpdateBrandDto } from './brand.dto';
import { type UserDocument } from 'src/DB/models/user.model';
import { ObjectCannedACL } from '@aws-sdk/client-s3';

import { ConflictException } from '@nestjs/common';
import successResponse from 'src/common/utils/response.success';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
    constructor(
        private readonly brandRepo: BrandRepo,
        private readonly s3Service: S3Service,
    ) { }

    async createBrand(file: Express.Multer.File, { title, slogan }: CreateBrandDto, user: UserDocument): Promise<any> {
        if (await this.brandRepo.findOne({ filter: { title } })) throw new ConflictException("brand already exists")

        const { secure_url, public_id } = await this.s3Service.uploadFile({
            file,
            path: `brands/${title}/brand_image`,
            ACL: ObjectCannedACL.public_read

        })

        const brand = await this.brandRepo.create({
            title,
            slogan,
            image: { secure_url, public_id },
            createdBy: user._id
        });

        if (!brand) {
            await this.s3Service.deleteFile(public_id);
            throw new BadGatewayException("faild to create brand")
        }

        return successResponse({ data: brand })
    }

    async updateBrand(id: Types.ObjectId, { title, slogan }: UpdateBrandDto, user: UserDocument): Promise<any> {
        const brand = await this.brandRepo.findById(id)
        if (!brand) throw new NotFoundException("brand not exists")

        if (title && title === brand.title) throw new BadRequestException("title not change please make any change to update it")

        if (title && await this.brandRepo.findOne({ filter: { title } })) throw new ConflictException("brand already exists")

        const updatedBrand = await this.brandRepo.findOneAndUpdate({
            filter: { _id: id },
            update: { title, slogan, updatedBy: user._id },
        })

        if (!updatedBrand) throw new NotFoundException("brand not found")
        return successResponse({ data: updatedBrand })
    }

    async updateBrandImage(file: Express.Multer.File, id: Types.ObjectId): Promise<any> {
        const brand = await this.brandRepo.findById(id)
        if (!brand) throw new NotFoundException("brand not found")

        const { secure_url, public_id } = await this.s3Service.uploadFile({
            file,
            path: `brands/${brand.title}/brand_image`,
            ACL: ObjectCannedACL.public_read
        })

        const updatedBrand = await this.brandRepo.findByIdAndUpdate({
            id,
            update: { image: { secure_url, public_id } },
        })
        if (!updatedBrand) throw new NotFoundException("brand not found")

        brand.image?.public_id && await this.s3Service.deleteFile(brand.image.public_id!)

        return successResponse({ data: updatedBrand })
    }

    async getAllBrands(query: QueryDto): Promise<any> {
        const { page, limit, search } = query;

        const brands = await this.brandRepo.findPaginated({
            page,
            limit,
            filter: search ? {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { slogan: { $regex: search, $options: "i" } }
                ]
            } : {},
        })

        return successResponse({ data: brands })
    }

    async getBrandById(id: Types.ObjectId): Promise<any> {
        const brand = await this.brandRepo.findById(id)
        if (!brand) throw new NotFoundException("brand not exists")
        return successResponse({ data: brand })
    }

    async deleteBrand(id: Types.ObjectId): Promise<any> {
        const brand = await this.brandRepo.findByIdAndDelete(id)
        if (!brand) throw new NotFoundException("brand not exists")
        await this.s3Service.deleteFile(brand?.image?.public_id!)
        return successResponse({ data: brand })
    }
}
