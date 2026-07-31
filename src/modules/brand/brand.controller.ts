import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleEnum } from 'src/common/enum/user.enum';
import { StorageEnum } from 'src/common/enum/multer_enum';
import { multer_cloud } from 'src/common/utils/multer.utils';
import { Auth } from 'src/common/decorator/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorator/user.decorator';
import { type UserDocument } from 'src/DB/models/user.model';
import { CreateBrandDto, idDto, QueryDto, UpdateBrandDto } from './brand.dto';
import { BrandService } from './brand.service';

@Controller('brand')
export class BrandController {
    constructor(private readonly brandService: BrandService) { }

    @Post()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileInterceptor('image', multer_cloud({ storageType: StorageEnum.disk })))
    createBrand(@UploadedFile() file: Express.Multer.File, @Body() body: CreateBrandDto, @User() user: UserDocument): Promise<any> {
        return this.brandService.createBrand(file, body, user);
    }

    @Patch("image/:id")
    @Auth({ roles: [RoleEnum.admin] })
    @UseInterceptors(FileInterceptor('image', multer_cloud({ storageType: StorageEnum.disk })))
    updateBrandImage(@UploadedFile() file: Express.Multer.File, @Param() params: idDto): Promise<any> {
        return this.brandService.updateBrandImage(file, params.id);
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth({ roles: [RoleEnum.admin] })
    updateBrand(@Param() Params: idDto, @Body() body: UpdateBrandDto, @User() user: UserDocument): Promise<any> {
        return this.brandService.updateBrand(Params.id, body, user);
    }

    @Get()
    getAllBrands(
        @Query() query: QueryDto
    ): Promise<any> {
        return this.brandService.getAllBrands(query);
    }

    @Get(":id")
    getCategoryById(@Param() params: idDto): Promise<any> {
        return this.brandService.getBrandById(params.id);
    }

    @Delete(":id")
    @Auth({ roles: [RoleEnum.admin] })
    deleteCategory(@Param() params: idDto): Promise<any> {
        return this.brandService.deleteBrand(params.id);
    }
}
