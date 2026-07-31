import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Max, Min } from "class-validator";
import { Types } from "mongoose";
import { AtLeastOneOf } from "src/common/decorator/brand.decorator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    title: string;

    @IsNotEmpty()
    @IsString()
    @Length(20, 30000)
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    price: number;

    @IsOptional()
    @Min(1)
    @Max(100)
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    discount?: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    stock: number;

    @IsNotEmpty()
    @IsMongoId()
    categoryId: Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    subCategoryId: Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    brandId: Types.ObjectId;
}

@AtLeastOneOf(['title', 'description', 'price', 'discount', 'stock', 'categoryId', 'subCategoryId', 'brandId'])
export class UpdateProductDto extends PartialType(CreateProductDto) { }