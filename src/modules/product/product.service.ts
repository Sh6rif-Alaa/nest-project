import CategoryRepo from "src/DB/repo/category.repo";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import S3Service from "src/common/services/s3.service";
import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { type UserDocument } from "src/DB/models/user.model";
import { BadGatewayException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import successResponse from "src/common/utils/response.success";
import { Types } from "mongoose";
import BrandRepo from "src/DB/repo/brand.repo";
import ProductRepo from "src/DB/repo/product.repo";
import SubCategoryRepo from "src/DB/repo/subCategory.repo";


@Injectable()
export class ProductService {
    constructor(
        private readonly productRepo: ProductRepo,
        private readonly categoryRepo: CategoryRepo,
        private readonly subCategoryRepo: SubCategoryRepo,
        private readonly brandRepo: BrandRepo,
        private readonly s3Service: S3Service,
    ) { }

    async createProduct(
        files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] },
        { title, price, discount, stock, categoryId, subCategoryId, brandId, description }: CreateProductDto,
        user: UserDocument
    ): Promise<any> {
        if (await this.productRepo.findOne({ filter: { title } })) throw new ConflictException("product already exists")

        if (!await this.categoryRepo.findById(categoryId)) throw new NotFoundException("category not found");
        if (!await this.subCategoryRepo.findById(subCategoryId)) throw new NotFoundException("sub category not found");
        if (!await this.brandRepo.findById(brandId)) throw new NotFoundException("brand not found");

        const finalPrice = price - (price * ((discount || 0) / 100))

        const { secure_url: mainSecureUrl, public_id: mainPublicId } = await this.s3Service.uploadFile({
            file: files.mainImage[0],
            path: `products/${title}/main_image`,
            ACL: ObjectCannedACL.public_read
        })

        let subImages: { secure_url: string, public_id: string }[] = [];
        if (files.subImages && files.subImages?.length > 0) {
            subImages = await this.s3Service.uploadFiles({
                files: files.subImages,
                path: `products/${title}/sub_images`,
                ACL: ObjectCannedACL.public_read
            })
        }

        const product = await this.productRepo.create({
            title,
            price: finalPrice,
            discount,
            stock,
            categoryId,
            subCategoryId,
            description,
            brandId,
            mainImage: { secure_url: mainSecureUrl, public_id: mainPublicId },
            subImages: subImages,
            createdBy: user._id
        });

        if (!product) {
            await this.s3Service.deleteFile(mainPublicId);
            await this.s3Service.deleteFiles(subImages.map((img) => img.public_id));
            throw new BadGatewayException("faild to create product")
        }

        return successResponse({ data: product })
    }

    async getAllProducts(): Promise<any> {
        const products = await this.productRepo.find()
        return successResponse({ data: products })
    }

    async getProductById(id: Types.ObjectId): Promise<any> {
        const product = await this.productRepo.findById(id)
        return successResponse({ data: product })
    }

    async updateProduct(
        files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] },
        id: Types.ObjectId,
        { title, description, price, discount, stock, categoryId, subCategoryId, brandId }: UpdateProductDto
    ): Promise<any> {
        if (await this.productRepo.findOne({ filter: { title } })) throw new ConflictException("Product already exists")
        const productBefore = await this.productRepo.findById(id)
        if (!productBefore) throw new NotFoundException("Product not found")

        if (categoryId && !await this.categoryRepo.findById(categoryId)) throw new NotFoundException("Category not found");
        if (subCategoryId && !await this.subCategoryRepo.findById(subCategoryId)) throw new NotFoundException("Sub Category not found");
        if (brandId && !await this.brandRepo.findById(brandId)) throw new NotFoundException("Brand not found");

        let finalPrice: number = productBefore.price
        let finalDiscount: number | undefined = productBefore.discount || 0

        if (discount && price) {
            finalPrice = price - (price * (discount / 100))
            finalDiscount = discount
        }
        else if (price) finalPrice = price - (price * (finalDiscount / 100))
        else if (discount) {
            finalDiscount = discount
            finalPrice = finalPrice - (finalPrice * (discount / 100))
        }

        let secure_url: string | undefined
        let public_id: string | undefined
        if (files.mainImage[0]) {
            const { secure_url: data1, public_id: data2 } = await this.s3Service.uploadFile({
                file: files.mainImage[0],
                path: `products/${title}/main_image`,
                ACL: ObjectCannedACL.public_read

            })
            secure_url = data1
            public_id = data2
        }

        let subImages: { secure_url: string, public_id: string }[] = [];
        if (files.subImages && files.subImages?.length > 0) {
            subImages = await this.s3Service.uploadFiles({
                files: files.subImages,
                path: `products/${title}/sub_images`,
                ACL: ObjectCannedACL.public_read
            })
        }
        const product = await this.productRepo.findByIdAndUpdate({
            id,
            update: { title, price: finalPrice, description, discount: finalDiscount, stock, categoryId, subCategoryId, brandId, mainImage: { secure_url, public_id }, subImages },
        })

        if (!product) throw new NotFoundException("Product not found")
        files.mainImage[0] && productBefore?.mainImage?.public_id && await this.s3Service.deleteFile(productBefore.mainImage.public_id!)
        files.subImages && files.subImages?.length > 0 && productBefore?.subImages && productBefore.subImages?.length > 0 && await this.s3Service.deleteFiles(productBefore.subImages.map((img) => img.public_id))
        return successResponse({ data: product })
    }

    async deleteProduct(id: Types.ObjectId): Promise<any> {
        const product = await this.productRepo.findByIdAndDelete(id)
        if (!product) throw new NotFoundException("Product not found")
        await this.s3Service.deleteFile(product.mainImage.public_id)
        if (product.subImages && product.subImages?.length > 0) 
            await this.s3Service.deleteFiles(product.subImages.map((img) => img.public_id))
        return successResponse({ data: product })
    }
}