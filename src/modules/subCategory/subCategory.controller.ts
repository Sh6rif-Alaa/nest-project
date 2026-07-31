import {
    Body, Controller, Delete, Get, Param, Patch, Post,
    Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { SubCategoryService } from './subCategory.service';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './subCategory.dto';
import { multer_cloud } from 'src/common/utils/multer.utils';
import { StorageEnum } from 'src/common/enum/multer_enum';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enum/user.enum';
import { User } from 'src/common/decorator/user.decorator';
import { type UserDocument } from 'src/DB/models/user.model';
import { idDto } from '../brand/brand.dto';

@Controller('subCategory')
export class SubCategoryController {
    constructor(private readonly subCategoryService: SubCategoryService) { }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileInterceptor('image', multer_cloud({ storageType: StorageEnum.disk })))
    createSubCategory(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateSubCategoryDto,
        @User() user: UserDocument
    ): Promise<any> {
        return this.subCategoryService.createSubCategory(file, body, user)
    }

    @Get()
    getAllSubCategories(@Query('categoryId') categoryId?: string): Promise<any> {
        const parsed = categoryId ? Types.ObjectId.createFromHexString(categoryId) : undefined
        return this.subCategoryService.getAllSubCategories(parsed)
    }

    @Get(':id')
    getSubCategoryById(@Param() params: idDto): Promise<any> {
        return this.subCategoryService.getSubCategoryById(params.id)
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileInterceptor('image', multer_cloud({ storageType: StorageEnum.disk })))
    updateSubCategory(
        @UploadedFile() file: Express.Multer.File,
        @Param() params: idDto,
        @Body() body: UpdateSubCategoryDto,
        @User() user: UserDocument
    ): Promise<any> {
        return this.subCategoryService.updateSubCategory(file, params.id, body, user)
    }

    @Delete(':id')
    @Auth({ roles: [RoleEnum.admin] })
    deleteSubCategory(@Param() params: idDto): Promise<any> {
        return this.subCategoryService.deleteSubCategory(params.id)
    }
}
