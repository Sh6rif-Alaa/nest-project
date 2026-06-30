import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./category.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multer_cloud } from "src/common/utils/multer.utils";
import { StorageEnum } from "src/common/enum/multer_enum";
import { Auth } from "src/common/decorator/auth.decorator";
import { RoleEnum } from "src/common/enum/user.enum";
import { User } from "src/common/decorator/user.decorator";
import { type UserDocument } from "src/DB/models/user.model";

@Controller("category")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileInterceptor('image', multer_cloud({ storageType: StorageEnum.disk })))
    createCategory(@UploadedFile() file: Express.Multer.File, @Body() body: CreateCategoryDto, @User() user: UserDocument): Promise<any> {
        return this.categoryService.createCategory(file, body, user);
    }

    @Get()
    getAllCategories(): Promise<any> {
        return this.categoryService.getAllCategories();
    }

    @Get(":id")
    getCategoryById(@Param('id') id: string): Promise<any> {
        return this.categoryService.getCategoryById(id);
    }

    @Delete(":id")
    @Auth({ roles: [RoleEnum.admin] })
    deleteCategory(@Param('id') id: string): Promise<any> {
        return this.categoryService.deleteCategory(id);
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileInterceptor('image', multer_cloud({ storageType: StorageEnum.disk })))
    updateCategory(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() body: CreateCategoryDto): Promise<any> {
        return this.categoryService.updateCategory(file, id, body);
    }
}