import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { multer_cloud } from "src/common/utils/multer.utils";
import { StorageEnum } from "src/common/enum/multer_enum";
import { Auth } from "src/common/decorator/auth.decorator";
import { RoleEnum } from "src/common/enum/user.enum";
import { User } from "src/common/decorator/user.decorator";
import { type UserDocument } from "src/DB/models/user.model";
import { idDto } from "../brand/brand.dto";

@Controller("product")
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileFieldsInterceptor([{ name: "mainImage", maxCount: 1 }, { name: "subImages", maxCount: 3 }], multer_cloud({ storageType: StorageEnum.disk })))
    createProduct(@UploadedFiles() files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] }, @Body() body: CreateProductDto, @User() user: UserDocument): Promise<any> {
        return this.productService.createProduct(files, body, user);
    }

    @Get()
    getAllProducts(): Promise<any> {
        return this.productService.getAllProducts();
    }

    @Get(":id")
    getProductById(@Param() params: idDto): Promise<any> {
        return this.productService.getProductById(params.id);
    }

    @Delete(":id")
    @Auth({ roles: [RoleEnum.admin] })
    deleteProduct(@Param() params: idDto): Promise<any> {
        return this.productService.deleteProduct(params.id);
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileFieldsInterceptor([{ name: "mainImage", maxCount: 1 }, { name: "subImages", maxCount: 3 }], multer_cloud({ storageType: StorageEnum.disk })))
    updateProduct(@UploadedFiles() files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] }, @Param() params: idDto, @Body() body: UpdateProductDto): Promise<any> {
        return this.productService.updateProduct(files, params.id, body);
    }

    @Post("/wishList/:id")
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth()
    addtoWishList(@Param() params: idDto, @User() user: UserDocument): Promise<any> {
        return this.productService.addtoWishList(params.id, user._id);
    }
}